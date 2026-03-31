import { BaseError, ErrorDetails } from './BaseError'

export class ConflictError extends BaseError {
  constructor(message: string, details?: ErrorDetails) {
    super(message, 'CONFLICT', true, details)
  }
}