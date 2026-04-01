import { BaseError, ErrorDetails } from './BaseError'

export class AuthorizationError extends BaseError {
  constructor(message: string, details: { code: string, details?: ErrorDetails }) {
    super(message, 'FORBIDDEN', true, details)
  }
}