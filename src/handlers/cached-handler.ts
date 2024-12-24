// import { BaseHandler, IDbService } from './base.handler';
// import { IDtoWithId } from '../data/base-db.service';
// import { IDtoWithId } from '../data/base-db.service';
// import { ListResultset } from '../data/list-resultset';
//
// export abstract class CachedHandler<DbServiceType extends IDbService<DtoType>, DtoType extends IDtoWithId> extends BaseHandler<DbServiceType, DtoType> {
//   protected key: string;
//
//   constructor(
//     protected dbService: DbServiceType,
//     private redisService: RedisService,
//     key: string,
//   ) {
//     super(dbService);
//     this.key = key;
//   }
//
//   async get(id: string): Promise<DtoType> {
//     const key: any = this.key + '_' + id;
//
//     if (await (await this.redisService.client(() => {})).exists(key)) {
//       const cachedValue: any = await (await this.redisService.client(() => {})).GET(key);
//       if (cachedValue) {
//         return cachedValue;
//       }
//     }
//     const retrievedValue: DtoType = await super.get(id);
//     if (retrievedValue) {
//       await (await this.redisService.client(() => {})).SAVE(key);
//     }
//
//     return retrievedValue;
//   }
//
//   async getAll(page: number, size: number, params: any[]): Promise<ListResultset<DtoType>> {
//     let key: any = this.key;
//     params.forEach((param: any) => {
//       const paramKey: string = Object.keys(param)[0];
//       key += '_' + param[paramKey];
//     });
//
//     if (await (await this.redisService.client(() => {})).exists(key)) {
//       const cachedValue: any = await (await this.redisService.client(() => {})).GET(key);
//       if (cachedValue) {
//         return cachedValue;
//       }
//     }
//
//     const retrievedValue: ListResultset<DtoType> = await super.getAll(page, size, params);
//     if (retrievedValue) {
//       await (await this.redisService.client(() => {})).SAVE(key);
//     }
//
//     return retrievedValue;
//   }
// }
