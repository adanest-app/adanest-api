import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  @IsMongoId()
  post: string;
}
