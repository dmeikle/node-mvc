import { Logger } from '@nestjs/common';
import { ListResultset } from '@mvc/data/list-resultset';

export abstract class BaseDbService<
  T extends IPrismaModelDelegate,
  DtoType extends IDtoWithId,
> implements IDbService<DtoType>
{
  private logger = new Logger(this.constructor.name);

  constructor(
    protected defaultDtoConstructor: new (model: any) => DtoType,
    protected table: T,
    protected hasCreatedBy: boolean = true,
    protected hasUpdatedBy: boolean = true,
    protected hasDeletedBy: boolean = true,
  ) {
    this.mapToDto = this.mapToDto.bind(this);
  }

  /**
   *
   * @param model
   * @param dtoConstructor
   */
  mapToDto<OverrideDtoType extends DtoType = DtoType>(
    model: any,
    dtoConstructor?: new (model: any) => OverrideDtoType,
  ): OverrideDtoType {
    // If a constructor is provided, use it to create the DTO
    if (dtoConstructor) {
      return new dtoConstructor(model);
    }

    return new this.defaultDtoConstructor(model) as OverrideDtoType;
  }

  createFilter(params: any): any {
    let filter: any = {};

    if (params.length === 0) {
      if (this.hasDeletedBy) {
        filter = { deletedAt: null };
      }
      return filter;
    }

    filter = params.reduce((acc: Record<string, any>, param: any) => {
      Object.keys(param).forEach((key: string) => {
        const value: any = param[key];

        if (key === 'AND' || key === 'OR') {
          this.handleLogicalOperator(acc, key, value);
        } else if (key.includes('.')) {
          this.handleNestedKey(acc, key, value);
        } else {
          acc[key] = value;
        }
      });

      return acc;
    }, {});

    if (
      this.hasDeletedBy &&
      (!filter.hasOwnProperty('deletedAt') || filter.deletedAt === null)
    ) {
      filter.deletedAt = null;
    }

    return filter;
  }

  private handleLogicalOperator(
    acc: Record<string, any>,
    key: string,
    value: any,
  ): void {
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key] = acc[key].concat(value);
  }

  private handleNestedKey(
    acc: Record<string, any>,
    key: string,
    value: any,
  ): void {
    const keys: string[] = key.split('.');
    let current: Record<string, any> = acc;

    keys.forEach((k: string, index: number) => {
      if (index === keys.length - 1) {
        current[k] = value;
      } else {
        current[k] = current[k] || {};
        current = current[k];
      }
    });
  }

  abstract throw404(id: string): void;

  protected getOrderBy(): Record<string, 'asc' | 'desc'> {
    return {};
  }

  protected getOrderByCustom(): Record<string, 'asc' | 'desc'> {
    return this.getOrderBy();
  }

  protected getExcludedFields(): (keyof DtoType)[] {
    return [];
  }

  protected removeExcludedFields(data: DtoType): Partial<DtoType> {
    const excludedFields: (keyof DtoType)[] = this.getExcludedFields();

    const filteredEntries: [string, any][] = Object.entries(data).filter(
      ([key]: [string, any]) => !excludedFields.includes(key as keyof DtoType),
    );

    return Object.fromEntries(filteredEntries) as Partial<DtoType>;
  }

  async create<CustomDtoType extends DtoType = DtoType>(
    accountMappingsId: string,
    request: CustomDtoType,
  ): Promise<CustomDtoType> {
    const filteredData: any = this.removeExcludedFields(request);

    if (this.hasCreatedBy) {
      filteredData.createdBy = accountMappingsId;
      filteredData.createdAt = new Date().toISOString();
    }

    if (this.hasUpdatedBy) {
      filteredData.updatedBy = accountMappingsId;
      filteredData.updatedAt = new Date().toISOString();
    }

    const createdItem: any = await this.table.create({
      data: filteredData,
    });

    return this.mapToDto<CustomDtoType>(createdItem);
  }

  async updateById<CustomDtoType extends DtoType = DtoType>(
    accountMappingsId: string,
    request: CustomDtoType,
    id: string,
  ): Promise<CustomDtoType> {
    try {
      // Fetch the existing item from the database
      const item: DtoType = await this.getById(id);

      // Remove excluded fields from the request data
      const filteredData: Partial<DtoType> = this.removeExcludedFields(request);

      // Initialize updateData object
      const updateData: any = {
        ...filteredData,
        ...(this.hasUpdatedBy
          ? {
              updatedBy: accountMappingsId,
              updatedAt: new Date(), // Prisma will handle Date objects
            }
          : {}),
      };

      // Perform the update in the database
      const result: any = await this.table.update({
        where: { id: item.id },
        data: updateData,
      });

      // Return the updated item mapped to the DTO format
      return this.mapToDto<CustomDtoType>(result);
    } catch (error: any) {
      this.logger.error(`Error updating item with id ${id}: ${error.message}`);
      throw new Error(`Unable to update item with id ${id}`);
    }
  }

  async getById<CustomDtoType extends DtoType = DtoType>(
    id: string,
  ): Promise<CustomDtoType> {
    let whereClause: any = {};
    if (this.hasDeletedBy) {
      whereClause = {
        id: id,
        deletedAt: null,
      };
    } else {
      whereClause = {
        id: id,
      };
    }

    return (await this.get(whereClause)) as CustomDtoType;
  }

  async getAll<CustomDtoType extends DtoType = DtoType>(
    page: number,
    size: number,
    params: Record<string, any>,
    orderBy?: Record<string, 'asc' | 'desc'>,
  ): Promise<ListResultset<CustomDtoType>> {
    const filter: any = params ? this.createFilter(params) : {};
    const sorting: any = orderBy ?? this.getOrderBy();

    //since we can pass in -1 (get all rows) we still want to ensure we are a positive integer
    const skip: number = size > 0 ? (page - 1) * size : 0;
    const take: number | undefined = size < 0 ? undefined : size;
    const [items, totalCount] = await Promise.all([
      this.table.findMany({
        where: filter,
        orderBy: sorting,
        take: take,
        skip: skip,
      }),
      this.table.count({
        where: filter,
      }),
    ]);

    return new ListResultset(
      items.map((item: any) => this.mapToDto(item)),
      page,
      size,
      totalCount,
      Math.ceil(totalCount / size),
    );
  }

  async update<CustomDtoType extends DtoType = DtoType>(
    accountMappingsId: string,
    request: CustomDtoType,
    params: Record<string, any>,
  ): Promise<CustomDtoType> {
    // This is a verification to ensure we're updating a record that exists
    await this.get(params);

    const filter: any = params.length > 0 ? this.createFilter(params) : {};
    const filteredData: any = this.removeExcludedFields(request);

    const updateData: any = {
      ...filteredData,
      ...(this.hasUpdatedBy
        ? {
            updatedBy: accountMappingsId,
            updatedAt: new Date().toISOString(),
          }
        : {}),
    };

    const result: any = await this.table.update({
      where: filter,
      data: updateData,
    });

    // Return the mapped result using the custom DTO type or the default DTO type
    return this.mapToDto<CustomDtoType>(result);
  }

  async createOrReplaceBulk<CustomDtoType extends DtoType = DtoType>(
    dtos: CustomDtoType[],
    deleteExistingKey?: { [key: string]: any },
  ): Promise<ListResultset<CustomDtoType>> {
    if (deleteExistingKey) {
      // Extract the key and value from the deleteExistingKey object
      const [key, value] = Object.entries(deleteExistingKey)[0];

      await this.table.deleteMany({
        where: {
          [key]: value,
        },
      });
    }
    await this.table.createMany({
      data: dtos,
    });

    return new ListResultset(dtos, 1, dtos.length, dtos.length, 1);
  }

  async get<CustomDtoType extends DtoType = DtoType>(
    paramsArray: Record<string, any>, // paramsArray is an object
  ): Promise<CustomDtoType> {
    // Using Object.entries to iterate over the object and merge properties
    const whereClause: Record<string, any> = { ...paramsArray };

    // Check if 'deletedAt' is a key in the paramsArray
    const hasDeletedAtKey: boolean = 'deletedAt' in paramsArray;

    // Add deletedAt=null if necessary
    if (this.hasDeletedBy && !hasDeletedAtKey) {
      whereClause.deletedAt = null;
    }

    // Query to find the item
    const item: any = await this.table.findFirst({
      where: whereClause,
    });

    // Throw an error if the item does not exist
    if (!item) {
      this.throw404(JSON.stringify(whereClause));
    }

    return this.mapToDto(item) as CustomDtoType;
  }

  async deleteCustom(
    accountMappingsId: string,
    params: Record<string, any>,
  ): Promise<void> {
    // Merging paramsArray into a single where clause object
    const whereClause: Record<string, any> = params.reduce(
      (acc: any, params: any) => ({ ...acc, ...params }),
      {},
    );

    if (this.hasDeletedBy) {
      // Perform a soft delete by updating `deletedBy` and `deletedAt`
      await this.table.update({
        where: { ...whereClause },
        data: {
          deletedBy: accountMappingsId,
          deletedAt: new Date().toISOString(),
        },
      });
    } else {
      // Perform a hard delete by removing the record entirely
      await this.table.delete({
        where: { ...whereClause },
      });
    }
  }

  async restore<CustomDtoType extends DtoType = DtoType>(
    accountMappingsId: string,
    id: string,
  ): Promise<CustomDtoType> {
    let whereClause: any = {};
    if (this.hasDeletedBy) {
      whereClause = {
        id: id,
        deletedAt: { not: null },
      };
    } else {
      whereClause = {
        id: id,
      };
    }

    // Query to find the soft-deleted item
    const item: DtoType = await this.table.findFirst({
      where: whereClause,
    });

    // Throw an error if the item does not exist
    if (!item) {
      this.throw404(id);
    }

    // Data to restore the item
    const restoredData: Record<string, any> = {
      deletedBy: null,
      deletedAt: null,
      ...(this.hasUpdatedBy
        ? { updatedBy: accountMappingsId, updatedAt: new Date().toISOString() }
        : {}),
    };

    // Perform the update to restore the item
    const result: DtoType = await this.table.update({
      where: { id: item.id },
      data: restoredData,
    });

    // Return the mapped DTO of the restored item
    return this.mapToDto<CustomDtoType>(result);
  }

  async updateMany<CustomDtoType extends DtoType = DtoType>(
    accountMappingsId: string,
    request: any,
    ids: string[],
  ): Promise<CustomDtoType[]> {
    const updateData: any = {
      ...request,
      ...(this.hasUpdatedBy
        ? {
            updatedBy: accountMappingsId,
            updatedAt: new Date().toISOString(),
          }
        : {}),
    };

    await this.table.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: updateData,
    });

    const updatedItems: any[] = await this.table.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    // Map the updated items to the desired DTO type
    return updatedItems.map((item: CustomDtoType) =>
      this.mapToDto<CustomDtoType>(item),
    );
  }

  async deleteById<CustomDtoType extends DtoType = DtoType>(
    accountMappingsId: string,
    id: string,
  ): Promise<void> {
    // Retrieve the item, possibly typed as CustomDtoType
    const item: CustomDtoType = await this.getById(id);

    if (this.hasDeletedBy) {
      // Perform a soft delete by updating `deletedBy` and `deletedAt`
      await this.table.update({
        where: {
          id: item.id,
        },
        data: {
          deletedBy: accountMappingsId,
          deletedAt: new Date().toISOString(),
        },
      });
    } else {
      // Perform a hard delete by removing the record entirely
      await this.table.delete({
        where: {
          id: item.id,
        },
      });
    }
  }

  async delete(
    accountMappingsId: string,
    params: Record<string, any>,
  ): Promise<void> {
    if (this.hasDeletedBy) {
      // Perform a soft delete by updating `deletedBy` and `deletedAt`
      await this.table.updateMany({
        where: params,
        data: {
          deletedBy: accountMappingsId,
          deletedAt: new Date().toISOString(),
        },
      });
    } else {
      await this.table.deleteMany({
        where: params,
      });
    }
  }
}

interface IPrismaModelDelegate {
  findFirst: (args: any) => Promise<any>;
  findMany: (args: any) => Promise<any>;
  create: (args: any) => Promise<any>;
  update: (args: any) => Promise<any>;
  updateMany: (args: any) => Promise<any>;
  count: (args: any) => Promise<any>;
  createMany: (args: any) => Promise<any>;
  deleteMany: (args: any) => Promise<any>;
  delete: (args: any) => Promise<any>;
}

export interface IDtoWithId {
  id: string;
}

export type ParamType = {
  [key: string]: string | undefined;
};
export interface IDbService<DtoType extends IDtoWithId> {
  create<CustomDtoType extends DtoType = DtoType>(
    id: string,
    request: CustomDtoType,
  ): Promise<CustomDtoType>;

  updateById<CustomDtoType extends DtoType = DtoType>(
    accountMappingsId: string,
    request: CustomDtoType,
    id: string,
  ): Promise<CustomDtoType>;

  deleteById(accountMappingsId: string, id: string): Promise<void>;

  getById<CustomDtoType extends DtoType = DtoType>(
    id: string,
  ): Promise<CustomDtoType>;

  get<CustomDtoType extends DtoType = DtoType>(
    paramsArray: Record<string, any>,
  ): Promise<CustomDtoType>;

  getAll<CustomDtoType extends DtoType = DtoType>(
    page: number,
    size: number,
    params: any,
    orderBy?: Record<string, 'asc' | 'desc'>,
  ): Promise<ListResultset<CustomDtoType>>;

  createOrReplaceBulk<CustomDtoType extends DtoType = DtoType>(
    dtos: CustomDtoType[],
    deleteExistingKey?: Record<string, any>,
  ): Promise<ListResultset<CustomDtoType>>;

  delete(accountMappingsId: string, params: Record<string, any>): Promise<void>;

  deleteCustom(
    accountMappingsId: string,
    params: Record<string, any>,
  ): Promise<void>;

  restore<CustomDtoType extends DtoType = DtoType>(
    accountMappingsId: string,
    id: string,
  ): Promise<CustomDtoType>;

  update<CustomDtoType extends DtoType = DtoType>(
    accountMappingsId: string,
    request: CustomDtoType,
    params: Record<string, any>,
  ): Promise<CustomDtoType>;
}
