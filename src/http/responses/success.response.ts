import { HttpResponse } from './http.response';
import { HttpStatus } from '@nestjs/common';

export class SuccessResponse extends HttpResponse {
  constructor(data: any, resource: string, id?: string, details?: object) {
    super(data, resource, id, details);
    this._httpStatus = HttpStatus.OK;
  }
}
