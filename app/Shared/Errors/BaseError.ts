export type ErrorDetails = Record<string, unknown> | unknown[] | string | number | boolean

export abstract class BaseError extends Error {
  public readonly code: string
  public readonly isOperational: boolean
  public readonly details?: ErrorDetails

  constructor(
    message: string,
    code: string,
    isOperational = true,
    details?: ErrorDetails
  ) {
    super(message)
    this.name = this.constructor.name
    this.code = code
    this.isOperational = isOperational
    this.details = details

    Error.captureStackTrace(this, this.constructor)
  }
}