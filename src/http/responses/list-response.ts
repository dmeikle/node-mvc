import { HttpResponse } from './http.response';
import { ListResultset } from '../../data/list-resultset';

export class ListResponse extends HttpResponse {
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly totalPages: number;

  constructor(
    resultSet: ListResultset<any>,
    resource: string,
    details?: object,
  ) {
    super(resultSet.list, resource, undefined, details);

    this.page = resultSet.page;
    this.pageSize = resultSet.pageSize;
    this.totalCount = resultSet.totalCount;
    this.totalPages = resultSet.totalPages;
  }
}
