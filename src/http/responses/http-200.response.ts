import { HttpResponse } from '@mvc/http/responses/http.response';

export class Http200Response extends HttpResponse {
  constructor(data: any, resource: string, id: string, details: object) {
    super(data, resource, id, details);
  }
}
