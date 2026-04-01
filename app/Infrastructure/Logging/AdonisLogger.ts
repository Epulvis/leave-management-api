import Logger from '@ioc:Adonis/Core/Logger'
import { ILogger, LogContext } from '../../Domain/Services/ILogger'

export class AdonisLogger implements ILogger {
  
  private buildPayload(Message: string, context?: LogContext) {
    return {
      Message,
      ...(context?.requestId && { RequestId: context.requestId }),
      ...(context?.userId && { UserId: context.userId }),
      ...(context?.method && { Method: context.method }),
      ...(context?.url && { URL: context.url }),
      ...(context?.status && { Status: context.status }),
      ...(context?.duration && { Duration: context.duration }),
      ...(context?.details && { Details: context.details }),
      ...(context?.stack && { Stack: context.stack }),
    }
  }

  public info(message: string, context?: LogContext): void {
    Logger.info(this.buildPayload(message, context))
  }

  public warn(message: string, context?: LogContext): void {
    Logger.warn(this.buildPayload(message, context))
  }

  public error(message: string, context?: LogContext): void {
    Logger.error(this.buildPayload(message, context))
  }

  public fatal(message: string, context?: LogContext): void {
    Logger.fatal(this.buildPayload(message, context))
  }

  public debug(message: string, context?: LogContext): void {
    Logger.debug(this.buildPayload(message, context))
  }
}