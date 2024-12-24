import {
  Body,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { ListResultset } from '../data/list-resultset';
import { ErrorResponse } from '../http/responses/error.response';
import { EndpointNotFoundError } from '@mvc/exceptions/endpoint-not-found.error';
import { SystemError } from '@mvc/exceptions/system.error';
import { ResponseStatusInterceptor } from '@mvc/interceptors/response-status.interceptor';
import { RefreshTokenInterceptor } from '@http/authentication/interceptors/refresh-token.interceptor';
import { UserContextInterceptorRequest } from '../../../../apps/users/src/user-contexts/middleware/contracts/user-context-interceptor.request';

/**
 * Base controller
 */
@UseInterceptors(ResponseStatusInterceptor, RefreshTokenInterceptor)
export abstract class BaseController<
  HandlerType extends IBaseHandler<DtoType>,
  RequestType,
  DtoType extends object,
  ResponseType,
  ListResponseType,
> {
  protected logger: Logger;
  static SYSTEM_ID = '00000000-0000-0000-0000-000000000000';
  private readonly defaultDtoConstructor: new (request: RequestType) => DtoType;

  constructor(protected readonly handler: HandlerType) {
    this.handler = handler;
    this.logger = new Logger(this.constructor.name);
    this.defaultDtoConstructor = this.getDtoConstructor();
  }

  abstract createResponseFromDto(dto: DtoType): ResponseType;
  abstract createResponseList(list: ListResultset<DtoType>): ListResponseType;
  abstract getDtoConstructor(): new (request: RequestType) => DtoType;

  /**
   * Create a DTO from a request
   *
   * @param request
   * @param dtoConstructor
   */
  createDtoFromRequest<OverrideDtoType extends DtoType = DtoType>(
    request: RequestType,
    dtoConstructor?: new (request: RequestType) => OverrideDtoType,
  ): OverrideDtoType {
    // If an overriding constructor is provided, use it
    if (dtoConstructor) {
      console.log('Using overriding constructor:', dtoConstructor.name);
      return new dtoConstructor(request);
    }

    // Otherwise, use the inferred default constructor
    return new this.defaultDtoConstructor(request) as OverrideDtoType;
  }

  /**
   * Delete an item by ID
   *
   * @param id
   * @param req
   */
  @Delete('/:id')
  async delete(
    @Param('id') id: string,
    @Req() req: UserContextInterceptorRequest,
  ): Promise<void | ErrorResponse> {
    try {
      const accountMappingsId: string = req.accountMappingsId;
      await this.handler.deleteById(accountMappingsId, id);
    } catch (error) {
      return new ErrorResponse(error as SystemError, 'delete');
    }
  }

  /**
   * Create an item
   *
   * @param body
   * @param req
   */
  @Post('/')
  async create(
    @Body() body: RequestType,
    @Req() req: UserContextInterceptorRequest,
  ): Promise<ResponseType | ErrorResponse> {
    try {
      const accountMappingsId: string = req.accountMappingsId;
      const dto: DtoType = this.createDtoFromRequest(body);
      if (
        'accountMappingsId' in dto &&
        (dto as any).accountMappingsId === undefined
      ) {
        (dto as any).accountMappingsId = req.accountMappingsId;
      }
      const item: DtoType = await this.handler.create(accountMappingsId, dto);

      return this.createResponseFromDto(item);
    } catch (error) {
      return new ErrorResponse(error as SystemError, 'create');
    }
  }

  /**
   * Get an item by ID
   *
   * @param id
   * @param _req
   */
  @Get('/:id')
  async get(
    @Param('id') id: string,
    @Req() _req: UserContextInterceptorRequest,
  ): Promise<ResponseType | ErrorResponse> {
    try {
      const item: DtoType = await this.handler.getById(id);

      return this.createResponseFromDto(item);
    } catch (error) {
      return new ErrorResponse(error as SystemError, 'get');
    }
  }

  /**
   * Get all items
   *
   * @param page
   * @param size
   * @param query
   * @param req
   */
  @Get('')
  async getAll(
    @Query('page') page: number,
    @Query('size') size: number,
    @Query('query') query: string,
    @Req() req: UserContextInterceptorRequest,
  ): Promise<ListResponseType | ErrorResponse> {
    try {
      const params: any[] = this.convertQueryToArray(req.url);
      const items: ListResultset<DtoType> = await this.handler.getAll(
        page,
        size,
        params,
      );

      return this.createResponseList(items);
    } catch (error) {
      return new ErrorResponse(error as SystemError, 'getAll');
    }
  }

  /**
   * Update an item by ID
   *
   * @param id
   * @param body
   * @param req
   */
  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() body: RequestType,
    @Req() req: UserContextInterceptorRequest,
  ): Promise<ResponseType | ErrorResponse> {
    try {
      const accountMappingsId: string = req.accountMappingsId;
      const dto: DtoType = this.createDtoFromRequest(body);
      const item: DtoType = await this.handler.updateById(
        accountMappingsId,
        dto,
        id,
      );

      return this.createResponseFromDto(item);
    } catch (error) {
      return new ErrorResponse(error as SystemError, 'update');
    }
  }

  /**
   * Delete an item by ID
   *
   * @param id
   * @param req
   */
  @Patch('/restore/:id')
  async restore(
    @Param('id') id: string,
    @Req() req: UserContextInterceptorRequest,
  ): Promise<ResponseType | ErrorResponse> {
    try {
      const accountMappingsId: string = req.accountMappingsId;
      const restoredItem: DtoType = await this.handler.restore(
        accountMappingsId,
        id,
      );

      return this.createResponseFromDto(restoredItem);
    } catch (error) {
      return new ErrorResponse(error as SystemError, 'restore');
    }
  }

  /**
   * example usage:
   *  const params: any[] = this.convertQueryToArray(req.url, { auctionId: auctionId });
   *
   * @param uri
   * @param additionalParams
   * @protected
   */
  protected convertQueryToArray(
    uri: string,
    additionalParams?: { [key: string]: any },
  ): Array<Record<string, any>> {
    const searchParams: URLSearchParams = new URLSearchParams(
      uri.split('?')[1],
    );

    searchParams.delete('page');
    searchParams.delete('size');

    // If additionalParams is provided, add or override the parameters in the searchParams
    if (additionalParams) {
      for (const [key, value] of Object.entries(additionalParams)) {
        searchParams.set(key, value.toString()); // Use .set to add or override a parameter
      }
    }

    const array: any[] = [];
    searchParams.forEach((value: string, key: string) => {
      array.push({ [key]: value });
    });

    return array;
  }

  /**
   * Create a DTO array from a body array
   *
   * @param body
   * @param dtoType
   * @param additionalValues
   * @protected
   */
  protected createDtoArray<DtoType>(
    body: any[],
    dtoType: new (item: any) => DtoType,
    additionalValues?: { [key: string]: any },
  ): DtoType[] {
    const values: DtoType[] = body.map((item: any) => {
      // Merge the item with any additional values provided
      const itemWithAdditionalValues: any = { ...item, ...additionalValues };
      return new dtoType(itemWithAdditionalValues);
    });

    return values;
  }

  /**
   * Handle a blocked endpoint
   *
   * @protected
   */
  protected blockedEndpoint(): ErrorResponse {
    return new ErrorResponse(new EndpointNotFoundError(), 'get');
  }
}

/**
 * Base handler interface
 */
export interface IBaseHandler<DtoType> {
  updateById<CustomDtoType extends DtoType = DtoType>(
    accountMappingsId: string,
    request: CustomDtoType,
    id: string,
  ): Promise<CustomDtoType>;

  /**
   * Delete an item by ID
   *
   * @param accountMappingsId
   * @param id
   */
  deleteById(accountMappingsId: string, id: string): Promise<void>;

  /**
   * Get an item by ID
   *
   * @param id
   */
  getById<CustomDtoType extends DtoType = DtoType>(
    id: string,
  ): Promise<CustomDtoType>;

  /**
   * Get an item by ID
   *
   * @param paramsArray
   */
  get<CustomDtoType extends DtoType = DtoType>(
    paramsArray: Record<string, any>,
  ): Promise<CustomDtoType>;

  /**
   * Get all items
   *
   * @param page
   * @param size
   * @param params
   * @param orderBy
   */
  getAll<CustomDtoType extends DtoType = DtoType>(
    page: number,
    size: number,
    params: any,
    orderBy?: Record<string, 'asc' | 'desc'>,
  ): Promise<ListResultset<CustomDtoType>>;

  /**
   * Create or replace a bulk of items
   *
   * @param dtos
   * @param deleteExistingKey
   */
  createOrReplaceBulk<CustomDtoType extends DtoType = DtoType>(
    dtos: CustomDtoType[],
    deleteExistingKey?: Record<string, any>,
  ): Promise<ListResultset<CustomDtoType>>;

  /**
   * Delete an item by ID
   *
   * @param accountMappingsId
   * @param params
   */
  delete(accountMappingsId: string, params: Record<string, any>): Promise<void>;

  /**
   * Delete an item by ID
   *
   * @param accountMappingsId
   * @param params
   */
  deleteCustom(
    accountMappingsId: string,
    params: Record<string, any>,
  ): Promise<void>;

  /**
   * Restore an item by ID
   *
   * @param accountMappingsId
   * @param id
   */
  restore<CustomDtoType extends DtoType = DtoType>(
    accountMappingsId: string,
    id: string,
  ): Promise<CustomDtoType>;

  /**
   * Update an item by ID
   *
   * @param accountMappingsId
   * @param request
   * @param params
   */
  update<CustomDtoType extends DtoType = DtoType>(
    accountMappingsId: string,
    request: CustomDtoType,
    params: Record<string, any>,
  ): Promise<CustomDtoType>;

  /**
   * Create a new item
   *
   * @param id
   * @param dto
   */
  create<CustomDtoType extends DtoType = DtoType>(
    id: string,
    dto: CustomDtoType,
  ): Promise<CustomDtoType>;
}

/**
 * Request interface for AccountMappingsInterceptor
 */
// interface UserContextInterceptorRequest extends Request {
//   accountMappingsId: string;
// }
