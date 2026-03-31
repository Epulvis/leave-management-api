import { schema, rules } from '@ioc:Adonis/Core/Validator'

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
}

export class LoginValidator {
  public schema = schema.create({
    email: schema.string({ trim: true }, [
      rules.email()
    ]),
    password: schema.string()
  })
}