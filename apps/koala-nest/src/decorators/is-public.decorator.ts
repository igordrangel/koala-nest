import { SetMetadata } from '@nestjs/common'
import { ApiBearerAuth, ApiSecurity } from '@nestjs/swagger'

export const IS_PUBLIC_KEY = 'isPublic'
export const IsPublic = () => SetMetadata(IS_PUBLIC_KEY, true)
