// src/common/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as
      | string
      | { message?: string; error?: string };

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message:
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : exceptionResponse.message || 'Internal server error',
      error:
        typeof exceptionResponse === 'string'
          ? exception.name
          : exceptionResponse.error || exception.name,
    };

    // Loguea el error para depuración
    if (Number(status) >= Number(HttpStatus.INTERNAL_SERVER_ERROR)) {
      this.logger.error(
        `HTTP Error: ${request.method} ${request.url} - Status: ${status} - Message: ${errorResponse.message}`,
        exception.stack,
      );
    } else {
      this.logger.warn(
        `HTTP Warning: ${request.method} ${request.url} - Status: ${status} - Message: ${errorResponse.message}`,
      );
    }

    response.status(status).json(errorResponse);
  }
}
