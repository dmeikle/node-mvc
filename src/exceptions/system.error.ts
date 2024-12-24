import { HttpStatus } from '@nestjs/common';

export abstract class SystemError extends Error {
  public readonly status: HttpStatus;
  public readonly name: string;
  /**
   *
   * @param message
   * @param errorCode
   * @param id
   * @param resourceUrl
   * @param httpStatus
   */
  constructor(
    message: string,
    public readonly errorCode: number,
    public readonly id?: string | number,
    public readonly resourceUrl?: string,
    httpStatus: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(message);
    this.status = httpStatus;
    this.name = this.constructor.name;
  }
}
