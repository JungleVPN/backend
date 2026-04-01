import { Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { RemnaPanelError } from './remna-panel.client';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown) {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      this.logger.error('HTTP exception', exception.message, exception.stack);
      return {
        statusCode: status,
        error: exception.message,
        content: exception.message,
      };
    }

    if (exception instanceof RemnaPanelError) {
      const status = exception.status || 502;
      this.logger.error(`${exception.message}`, exception.context);
      return {
        statusCode: status,
        error: exception.message,
        content: exception.message,
      };
    }

    this.logger.error('Unhandled exception', exception);
    return {
      error: 'Internal server error',
      statusCode: 500,
    };
  }
}
