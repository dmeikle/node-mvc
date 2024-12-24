import { ListResultset } from '@mvc/data/list-resultset';
import { IDbService, IDtoWithId } from '@mvc/data/base-db.service';

export abstract class BaseHandler<
  DbServiceType extends IDbService<DtoType>,
  DtoType extends IDtoWithId,
> implements IDbService<DtoType>
{
  constructor(protected dbService: DbServiceType) {}

  async updateById<CustomDtoType extends DtoType = DtoType>(
    accountMappingsId: string,
    request: CustomDtoType,
    id: string,
  ): Promise<CustomDtoType> {
    return await this.dbService.updateById<CustomDtoType>(
      accountMappingsId,
      request,
      id,
    );
  }

  async deleteById(accountMappingsId: string, id: string): Promise<void> {
    return await this.dbService.deleteById(accountMappingsId, id);
  }

  async getById<CustomDtoType extends DtoType = DtoType>(
    id: string,
  ): Promise<CustomDtoType> {
    return await this.dbService.getById<CustomDtoType>(id);
  }

  async get<CustomDtoType extends DtoType = DtoType>(
    paramsArray: Record<string, any>,
  ): Promise<CustomDtoType> {
    return await this.dbService.get<CustomDtoType>(paramsArray);
  }

  async getAll<CustomDtoType extends DtoType = DtoType>(
    page: number,
    size: number,
    params: any,
    orderBy?: Record<string, 'asc' | 'desc'>,
  ): Promise<ListResultset<CustomDtoType>> {
    return await this.dbService.getAll<CustomDtoType>(
      page,
      size,
      params,
      orderBy,
    );
  }

  async createOrReplaceBulk<CustomDtoType extends DtoType = DtoType>(
    dtos: CustomDtoType[],
    deleteExistingKey?: Record<string, any>,
  ): Promise<ListResultset<CustomDtoType>> {
    return await this.dbService.createOrReplaceBulk<CustomDtoType>(
      dtos,
      deleteExistingKey,
    );
  }

  async delete(
    accountMappingsId: string,
    params: Record<string, any>,
  ): Promise<void> {
    return await this.dbService.delete(accountMappingsId, params);
  }

  async deleteCustom(
    accountMappingsId: string,
    params: Record<string, any>,
  ): Promise<void> {
    return await this.dbService.deleteCustom(accountMappingsId, params);
  }

  async restore<CustomDtoType extends DtoType = DtoType>(
    accountMappingsId: string,
    id: string,
  ): Promise<CustomDtoType> {
    return await this.dbService.restore<CustomDtoType>(accountMappingsId, id);
  }

  async update<CustomDtoType extends DtoType = DtoType>(
    accountMappingsId: string,
    request: CustomDtoType,
    params: Record<string, any>,
  ): Promise<CustomDtoType> {
    return await this.dbService.update<CustomDtoType>(
      accountMappingsId,
      request,
      params,
    );
  }

  async create<CustomDtoType extends DtoType = DtoType>(
    id: string,
    dto: CustomDtoType,
  ): Promise<CustomDtoType> {
    return await this.dbService.create<CustomDtoType>(id, dto);
  }
}
