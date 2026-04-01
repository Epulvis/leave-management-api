import { BaseError, ErrorDetails } from './BaseError'

export class TechnicalError extends BaseError {
  constructor(message: string, details?: ErrorDetails) {
    super(
      message,
      'TECHNICAL_ERROR',
      true,
      details
    )
  }
}