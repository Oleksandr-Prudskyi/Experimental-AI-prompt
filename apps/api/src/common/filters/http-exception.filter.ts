import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const error =
      typeof exceptionResponse === 'object'
        ? {
            code: (exceptionResponse as any).code || 'ERROR',
            message: (exceptionResponse as any).message || exception.message,
            details: (exceptionResponse as any).details,
          }
        : { code: 'ERROR', message: exceptionResponse };

    response.status(status).json({ error });
  }
}
