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
import ApiResponse from '../Interfaces/Http/Responses/ApiResponse'

export default class ExceptionHandler extends HttpExceptionHandler {
  constructor() {
    super(Logger)
  }

  // protected ignoreStatuses = [
  //   400, // Bad Request
  //   404, // Not Found
  //   422, // Validation Error
  // ]

  public async handle(error: any, ctx: HttpContextContract) {
    const { response } = ctx

    // 1. Tangkap Error Validasi Input dari Adonis Validator
    if (error.code === 'E_VALIDATION_FAILURE') {
       const result = ApiResponse.error<any>(
        'Validasi data gagal. Silakan periksa kembali input Anda.',
        error.messages
      )
      return ctx.response.status(422).json(result)
    }

    if (error.status === 404 || error.code === 'E_ROUTE_NOT_FOUND') {
      const result = ApiResponse.error<any>(
        'Endpoint atau data yang Anda minta tidak ditemukan.',
        { requested_url: ctx.request.url() } // Memberikan info tambahan URL mana yang salah
      )
      return ctx.response.status(404).json(result)
    }

    // 2. Tangkap Error Autentikasi (Token tidak valid / tidak ada)
    if (error.code === 'E_UNAUTHORIZED_ACCESS') {
      return response.status(401).json(
        ApiResponse.error('Unauthorized access. Please provide a valid token.')
      )
    }

    // 3. Tangkap Error Database (Contoh: ID tidak ditemukan saat pakai findOrFail)
    if (error.code === 'E_ROW_NOT_FOUND') {
      return response.status(404).json(
        ApiResponse.error('Resource not found')
      )
    }

    // 4. Tangkap Custom Business Logic Error dari UseCase (Domain/Logic Rules)
    if (error.message === 'Invalid credentials' || error.message === 'Email already registered') {
      return response.status(400).json(
        ApiResponse.error(error.message)
      )
    }

    // 5. Fallback Default: Internal Server Error (Untuk error tak terduga)
    Logger.error(error) 
    
    const status = error.status || 500
    const message = status === 500 ? 'Internal server error' : error.message
    
    return response.status(status).json(
      ApiResponse.error(message)
    )
  }
}