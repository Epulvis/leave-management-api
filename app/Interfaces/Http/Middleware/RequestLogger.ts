import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { AdonisLogger } from '../../../Infrastructure/Logging/AdonisLogger'

export default class RequestLogger {
  private logger = new AdonisLogger()

  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
    const start = Date.now()
    const requestId = ctx.request.id() || Math.random().toString(36).substring(2, 9)

    await next()

    const duration = Date.now() - start
    const status = ctx.response.getStatus()

    if (status < 400) {
      this.logger.info('Incoming Request', {
        requestId,
        method: ctx.request.method(),
        url: ctx.request.url(),
        status,
        duration: `${duration}ms`,
        userId: ctx.auth?.user?.id ?? null,
      })
    }
  }
}