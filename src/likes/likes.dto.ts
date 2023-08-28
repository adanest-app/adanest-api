import { IsMongoId } from 'class-validator';

export class PostIdDto {
  @IsMongoId()
  postId: string;
}
