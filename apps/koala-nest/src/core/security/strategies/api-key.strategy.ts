import { UnauthorizedException } from '@nestjs/common'
import { Request } from 'express'
import { Strategy } from 'passport-custom'

export type DoneFn = (err: Error | null, user?: any) => void

interface ApiKeyStrategyOptions {
  header: string
  prefix?: string
}

abstract class ApiKeyStrategyBase extends Strategy {
  constructor({ header, prefix }: ApiKeyStrategyOptions) {
    super(async (request: Request, done: DoneFn) => {
      try {
        const apikey = request.headers[header.toLowerCase()] as string
        const apiKeyEncoded = apikey?.replace(`${prefix || ''} `, '')

        if (apiKeyEncoded) {
          return await this.validate(apiKeyEncoded, done, request)
        }

        return done(new UnauthorizedException())
      } catch (err) {
        return done(err, null)
      }
    })
  }

  abstract validate(
    apikey: string,
    done: DoneFn,
    request: Request,
  ): Promise<void> | void
}

export class ApiKeyStrategy extends ApiKeyStrategyBase {
  constructor(options: ApiKeyStrategyOptions) {
    super(options)
  }

  validate(apikey: string, done: DoneFn, request: Request) {
    throw new Error('Method not implemented.')
  }
}
