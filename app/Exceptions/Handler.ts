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

import Logger from '@ioc:Adonis/Core/Logger'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Env from '@ioc:Adonis/Core/Env'
import { BaseError } from '../Shared/Errors/BaseError'
import ApiResponse from '../Interfaces/Http/Responses/ApiResponse'

export default class ExceptionHandler extends HttpExceptionHandler {
  constructor() {
    super(Logger)
  }

  // Mapper eksklusif di layer Interface
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

  public async handle(error: any, ctx: HttpContextContract) {
    const { response, request } = ctx
    const isDev = Env.get('NODE_ENV') === 'development'

    if (error instanceof BaseError) {
      if (!error.isOperational) {
        Logger.error(`[${error.code}] ${error.message}`, { details: error.details, stack: error.stack })
      }

      return response.status(this.getHttpStatus(error.code)).json(
        ApiResponse.error(error.message, {
          code: error.code,
          ...(isDev && error.details && { technical: error.details }),
        })
      )
    }

    // 2. Tangani Error Bawaan Framework AdonisJS
    if (error.code === 'E_VALIDATION_FAILURE') {
      return response.status(422).json(
        ApiResponse.error('Validasi data gagal. Silakan periksa kembali input Anda.', {
          code: 'VALIDATION_ERROR',
          details: error.messages,
        })
      )
    }

    if (error.code === 'E_ROUTE_NOT_FOUND') {
      return response.status(404).json(
        ApiResponse.error('Endpoint yang Anda tuju tidak ditemukan.', {
          code: 'NOT_FOUND',
          requested_url: request.url(),
        })
      )
    }

    // 3. Fallback: Tangkap Error Tak Terduga (Mencegah SQL Leak)
    Logger.fatal('Unexpected Error', { message: error.message, stack: error.stack })

    return response.status(500).json(
      ApiResponse.error('Terjadi kesalahan internal pada server.', {
        code: 'TECHNICAL_ERROR',
        ...(isDev && { technical: error.message }),
      })
    )
  }
}