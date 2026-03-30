import { BaseError, ErrorDetails } from './BaseError'

export class NotFoundError extends BaseError {
  constructor(message: string, details?: ErrorDetails) {
    super(message, 'NOT_FOUND', true, details)
  }
}