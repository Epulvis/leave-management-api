/*
|--------------------------------------------------------------------------
| Http Exception Handler
|--------------------------------------------------------------------------
|
| AdonisJs will forward all exceptions occurred during an HTTP request to
| the following class. You can learn more about exception handling by
| reading docs.
|
| The exception handler extends a base `HttpExceptionHandler` which is not
| mandatory, however it can do lot of heavy lifting to handle the errors
| properly.
|
*/

import Env from '@ioc:Adonis/Core/Env'
import Logger from '@ioc:Adonis/Core/Logger'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { BaseError } from '../Shared/Errors/BaseError'
import ApiResponse from '../Interfaces/Http/Responses/ApiResponse'
import { SystemMessages, ErrorCodes } from '../Shared/Constants/ErrorDictionary'
import { ILogger } from 'App/Domain/Services/ILogger'
import { AdonisLogger } from 'App/Infrastructure/Logging/AdonisLogger'
import { LogEvents } from 'App/Shared/Constants/LogEvents'

export default class ExceptionHandler extends HttpExceptionHandler {
  private customLogger: ILogger = new AdonisLogger()

  constructor() {
    super(Logger)
  }

  private getHttpStatus(code: string): number {
    const statusMap: Record<string, number> = {
      'VALIDATION_ERROR': 422,
      'DOMAIN_ERROR': 400,
      'FORBIDDEN': 403,
      'NOT_FOUND': 404,
      'CONFLICT': 409,
      'UNAUTHORIZED': 401,
      'INFRASTRUCTURE_ERROR': 500,
      'TECHNICAL_ERROR': 500,
    }
    return statusMap[code] || 500
  }

  /**
   * REPORT LAYER: Murni untuk keperluan pencatatan Log.
   * Tidak ada balikan (response) ke user di sini.
  **/
  public async report(error: any, ctx: HttpContextContract) {
    if (!this.shouldReport(error)) {
      return
    }

    const status = error instanceof BaseError ? this.getHttpStatus(error.code) : (error.status || 500)
      
    const logContext = {
      requestId: ctx.request.id() || 'unknown',
      userId: ctx.auth?.user?.id?.toString() ?? null,
      method: ctx.request.method(),
      url: ctx.request.url(),
      status: status,
      duration: 'failed',
      stack: error.stack,
      details: error.details || error.messages || error.message,
    }

    if (error instanceof BaseError) {
      if (!error.isOperational) {
        this.customLogger.fatal(LogEvents.SYSTEM_CRASH, logContext)
      } else if (status >= 500) {
        this.customLogger.error(LogEvents.SYSTEM_ERROR, logContext)
      } else if (status === 401 || status === 403) {
        this.customLogger.warn(LogEvents.SECURITY_WARN, logContext)
      } else {
        this.customLogger.info(LogEvents.CLIENT_ERROR, logContext)
      }
    } else {
      if (status >= 500) {
        this.customLogger.fatal(LogEvents.UNHANDLED_ERROR, logContext)
      } else {
        this.customLogger.info(LogEvents.FRAMEWORK_ERROR, logContext)
      }
    }
  }

  public async handle(error: any, ctx: HttpContextContract) {
    const { response, request } = ctx
    
    const isDev = Env.get('NODE_ENV') === 'development'
    const isProduction = Env.get('NODE_ENV') === 'production'

    if (error instanceof BaseError) {
      const status = this.getHttpStatus(error.code)

      return response.status(status).json(
        ApiResponse.error(error.message, {
          code: error.code,
          ...(isProduction ? {} : { technical: error.details })
        })
      )
    }

    if (error.code === 'E_VALIDATION_FAILURE') {
      return response.status(422).json(
        ApiResponse.error(SystemMessages.VALIDATION_FAILED, {
          code: ErrorCodes.VALIDATION_ERROR,
          details: error.messages,
        })
      )
    }

    if (error.code === 'E_ROUTE_NOT_FOUND') {
      return response.status(404).json(
        ApiResponse.error(SystemMessages.NOT_FOUND, {
          code: ErrorCodes.NOT_FOUND,
          requested_url: request.url(),
        })
      )
    }

    return response.status(500).json(
      ApiResponse.error(SystemMessages.INTERNAL_ERROR, {
        code: ErrorCodes.SYSTEM_CRASH,
          ...(isDev && { technical: error.message }),
        })
    )
  }
}