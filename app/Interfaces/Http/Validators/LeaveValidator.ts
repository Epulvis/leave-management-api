import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { ValidationMessages } from 'App/Shared/Constants/ValidationMessages'

export class ApplyLeaveValidator {
  public schema = schema.create({
    start_date: schema.date({ format: 'yyyy-MM-dd' }),
    end_date: schema.date({ format: 'yyyy-MM-dd' }),
    reason: schema.string({ trim: true }, [rules.maxLength(255)]),
    attachment: schema.file({
      size: '2mb',
      extnames: ['jpg', 'png', 'pdf'],
    })
  })
  
  public messages = {
    'start_date.required': ValidationMessages.leave.start_date.required,
    'start_date.date.format': ValidationMessages.leave.start_date.format,

    'end_date.required': ValidationMessages.leave.end_date.required,
    'end_date.date.format': ValidationMessages.leave.end_date.format,

    'reason.required': ValidationMessages.leave.reason.required,
    'reason.maxLength': ValidationMessages.leave.reason.maxLength,

    'attachment.file.size': ValidationMessages.leave.attachment.size,
    'attachment.file.extname': ValidationMessages.leave.attachment.extnames,
  }
}