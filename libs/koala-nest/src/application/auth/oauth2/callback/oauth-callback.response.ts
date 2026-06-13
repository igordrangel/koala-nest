import { ApiProperty } from '@nestjs/swagger';

/** Resposta mínima do callback OAuth — o Scalar lê `code` (e opcionalmente `state`). */
export class OAuthCallbackResponse {
  @ApiProperty()
  code: string;

  @ApiProperty({ required: false })
  state?: string;
}
