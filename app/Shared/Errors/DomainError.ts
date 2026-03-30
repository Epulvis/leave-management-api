import { BaseError, ErrorDetails } from './BaseError'

export class DomainError extends BaseError {
  constructor(message: string, details?: ErrorDetails) {
    super(message, 'DOMAIN_ERROR', true, details)
  }
}