import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { ErrorResponse } from '@mvc/http/responses/error.response';

@Injectable()
export class ResponseStatusInterceptor implements NestInterceptor {
  static RESPONSE_STATUSES: { [key: string]: number } = {
    DELETE: HttpStatus.NO_CONTENT,
    GET: HttpStatus.OK,
    POST: HttpStatus.CREATED,
    PATCH: HttpStatus.OK,
    PUT: HttpStatus.OK,
  };

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx: HttpArgumentsHost = context.switchToHttp();
    const request: Request = ctx.getRequest<Request>();

    return next.handle().pipe(
      map((result: any) => {
        const response = ctx.getResponse();

        if (result instanceof ErrorResponse) {
          response.status(result.httpStatus);
          return result;
        } else if (result instanceof Error) {
          response.status(HttpStatus.BAD_REQUEST);
          return { message: result.message };
        } else {
          const status: number =
            ResponseStatusInterceptor.RESPONSE_STATUSES[request.method] ||
            HttpStatus.OK;
          response.status(status);
          return result;
        }
      }),
    );
  }
}
