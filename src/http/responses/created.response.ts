import { HttpResponse } from './http.response';

export class CreatedResponse extends HttpResponse {
  constructor(data: any, resource: string, id?: string, details?: object) {
    super(data, resource, id, details);
  }
}
