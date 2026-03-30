import { BaseError, ErrorDetails } from './BaseError'

export class ValidationError extends BaseError {
  constructor(message: string, details?: ErrorDetails) {
    super(message, 'VALIDATION_ERROR', true, details)
  }
}