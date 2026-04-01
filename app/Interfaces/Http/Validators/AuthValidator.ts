import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { ValidationMessages } from 'App/Shared/Constants/ValidationMessages'

export class RegisterValidator {
  public schema = schema.create({
    email: schema.string({ trim: true }, [
      rules.email()
    ]),
    password: schema.string({}, [
      rules.minLength(6)
    ]),
    full_name: schema.string({ trim: true })
  })

  public messages = {
    'email.required': ValidationMessages.auth.email.required,
    'email.email': ValidationMessages.auth.email.invalid,
    'password.required': ValidationMessages.auth.password.required,
    'password.minLength': ValidationMessages.auth.password.minLength,
    'full_name.required': ValidationMessages.auth.fullName.required,
  }
}

export class LoginValidator {
  public schema = schema.create({
    email: schema.string({ trim: true }, [
      rules.email()
    ]),
    password: schema.string()
  })

  public messages = {
    'email.required': ValidationMessages.auth.email.required,
    'email.email': ValidationMessages.auth.email.invalid,
    'password.required': ValidationMessages.auth.password.required,
  }
}