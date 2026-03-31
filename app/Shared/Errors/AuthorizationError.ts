import { BaseError } from './BaseError'

export class AuthorizationError extends BaseError {
  constructor(message = 'Anda tidak memiliki akses') {
    super(message, 'FORBIDDEN', true)
  }
}