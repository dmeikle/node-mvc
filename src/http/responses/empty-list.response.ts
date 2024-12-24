import { ListResponse } from './list-response';
import { ListResultset } from '../../data/list-resultset';

export class EmptyListResponse extends ListResponse {
  constructor(resource: string) {
    super(new ListResultset<any>([], 1, 0, 0, 1), resource, {});
  }
}
