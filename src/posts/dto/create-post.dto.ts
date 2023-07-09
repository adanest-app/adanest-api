import { IsEnum, IsNotEmpty, IsUrl } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  @IsUrl()
  cover: string;

  @IsEnum(['forum', 'blog'])
  type: string;
}
