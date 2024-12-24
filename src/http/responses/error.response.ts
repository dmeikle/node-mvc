import { SystemError } from '../../exceptions/system.error';
import { HttpResponse } from './http.response';

export class ErrorResponse extends HttpResponse {
  private error: boolean;
  private status: any;
  private errorCode: number;
  private message: string;
  private help: object;

  /**
   *
   * @param exception
   * @param resource
   * @param id
   * @param details
   */
  constructor(
    exception: SystemError,
    resource: string,
    id?: string,
    details?: object,
  ) {
    super(exception, resource, id, details);
    this.error = true;
    this.status = exception.status;
    this.errorCode = exception.errorCode;
    this.message = exception.message;

    this.help = {
      documentation: exception.resourceUrl,
    };
    //  this._httpStatus = exception.httpStatus ?? HttpStatus.INTERNAL_SERVER_ERROR;
  }
  getMessage(): string {
    return this.message;
  }
  getErrorCode(): number {
    return this.errorCode;
  }
  getStatus(): any {
    return this.status;
  }
}
