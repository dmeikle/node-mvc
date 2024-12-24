import { SystemError } from './system.error';

export class NotFoundSystemError extends SystemError {
  constructor(
    message: string,
    errorCode: number,
    id: string,
    resourceUrl: string,
  ) {
    super(message, errorCode, id, resourceUrl);
  }
}
