import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? this.extractMessage(exception)
        : 'Erro interno inesperado';

    response.status(status).json({
      error: {
        code: status,
        message,
      },
    });
  }

  private extractMessage(exception: HttpException): string {
    const body = exception.getResponse();
    if (typeof body === 'string') return body;
    if (typeof body === 'object' && body !== null && 'message' in body) {
      const msg = (body as { message: unknown }).message;
      return Array.isArray(msg) ? msg.join(', ') : String(msg);
    }
    return exception.message;
  }
}
