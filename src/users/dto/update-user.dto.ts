import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  MinLength,
} from 'class-validator';

export class NewUserDTO {
  @IsOptional()
  @IsNotEmpty()
  username?: string;

  @IsOptional()
  @IsEmail()
  @IsNotEmpty()
  email?: string;

  @IsOptional()
  @IsNotEmpty()
  firstName?: string;

  @IsOptional()
  lastName?: string;

  @IsOptional()
  @IsUrl()
  avatar?: string;

  @IsOptional()
  bio?: string;

  @IsOptional()
  @MinLength(8)
  password?: string;
}
