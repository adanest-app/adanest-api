import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateReplyDto {
  @IsNotEmpty()
  content: string;

  @IsMongoId()
  comment: string;
}
