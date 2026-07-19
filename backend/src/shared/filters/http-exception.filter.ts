import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { ConflictError, NotFoundError } from '../domain-errors';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const { status, message } = this.resolve(exception);

    response.status(status).json({
      error: {
        code: status,
        message,
      },
    });
  }

  private resolve(exception: unknown): { status: number; message: string } {
    if (exception instanceof NotFoundError) {
      return { status: HttpStatus.NOT_FOUND, message: exception.message };
    }
    if (exception instanceof ConflictError) {
      return { status: HttpStatus.CONFLICT, message: exception.message };
    }
    if (exception instanceof HttpException) {
      return { status: exception.getStatus(), message: this.extractMessage(exception) };
    }
    this.logger.error('Erro interno inesperado', (exception as Error)?.stack ?? String(exception));
    return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Erro interno inesperado' };
  }

  private extractMessage(exception: HttpException): string {
    const body = exception.getResponse();
    if (typeof body === 'string') return body;
    if (typeof body === 'object' && body !== null) {
      const zodErrors = (body as { errors?: { path: string[]; message: string }[] }).errors;
      if (Array.isArray(zodErrors) && zodErrors.length > 0) {
        return zodErrors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
      }
      if ('message' in body) {
        const msg = (body as { message: unknown }).message;
        return Array.isArray(msg) ? msg.join(', ') : String(msg);
      }
    }
    return exception.message;
  }
}
