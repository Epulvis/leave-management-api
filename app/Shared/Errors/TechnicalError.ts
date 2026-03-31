import { BaseError, ErrorDetails } from './BaseError'

export class TechnicalError extends BaseError {
  constructor(technical?: ErrorDetails) {
    super(
      'Terjadi kesalahan pada sistem.',
      'TECHNICAL_ERROR',
      false,
      technical
    )
  }
}