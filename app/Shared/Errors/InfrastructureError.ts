import { BaseError, ErrorDetails } from './BaseError'

export class InfrastructureError extends BaseError {
  constructor(message: string, technicalDetails?: ErrorDetails) {
    super(message, 'INFRASTRUCTURE_ERROR', false, {
      technical: technicalDetails
    })
  }
}