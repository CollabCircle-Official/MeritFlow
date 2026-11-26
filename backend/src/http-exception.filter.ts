import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  catch(error: unknown, host: ArgumentsHost) { const ctx = host.switchToHttp(); const response = ctx.getResponse<Response>(); const request = ctx.getRequest<Request>(); const status = error instanceof HttpException ? error.getStatus() : 500; const detail = error instanceof HttpException ? error.getResponse() : 'Internal server error'; if (status >= 500) this.logger.error(error instanceof Error ? error.stack : String(error)); response.status(status).json({ statusCode: status, path: request.url, timestamp: new Date().toISOString(), error: detail }); }
}
