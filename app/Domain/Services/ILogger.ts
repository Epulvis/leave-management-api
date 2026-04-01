export interface LogContext {
  requestId?: string
  id?: number | string | null
  userId?: string | null
  method?: string
  url?: string
  adminId?: string | null
  status?: number | string
  totalData?: number
  employeeId?: string | null
  duration?: string | number
  daysRefunded?: number
  stack?: string
  details?: any
  email?: string | null
  provider?: string
  year?: number
}

export interface ILogger {
  info(message: string, context?: LogContext): void
  warn(message: string, context?: LogContext): void
  error(message: string, context?: LogContext): void
  fatal(message: string, context?: LogContext): void
  debug(message: string, context?: LogContext): void
}