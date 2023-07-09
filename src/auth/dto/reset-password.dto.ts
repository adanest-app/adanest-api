import { IsJWT, IsNotEmpty, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsJWT()
  token: string;

  @MinLength(8)
  @IsNotEmpty()
  password: string;
}
