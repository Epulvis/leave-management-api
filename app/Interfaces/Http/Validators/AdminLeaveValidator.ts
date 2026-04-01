import { schema } from '@ioc:Adonis/Core/Validator'
import { ValidationMessages } from 'App/Shared/Constants/ValidationMessages'

export class ExecuteLeaveValidator {
  public schema = schema.create({
    action: schema.enum(['approve', 'reject'] as const)
  })

  public messages = {
    'action.enum': ValidationMessages.adminLeave.action,
    'action.required': ValidationMessages.adminLeave.required,
  }
}