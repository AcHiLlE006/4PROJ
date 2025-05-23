import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com'})
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 6 })
  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;
}
