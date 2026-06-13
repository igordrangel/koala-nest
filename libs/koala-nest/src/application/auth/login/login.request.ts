import { ApiProperty } from '@nestjs/swagger';

export class LoginRequest {
  @ApiProperty({ example: 'admin@example.com' })
  username: string;

  @ApiProperty({ example: 'admin123' })
  password: string;
}
