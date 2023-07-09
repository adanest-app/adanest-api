import { IsNotEmpty } from 'class-validator';

export class UpdateReplyDto {
  @IsNotEmpty()
  content: string;
}
