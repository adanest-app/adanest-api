import { IsMongoId } from 'class-validator';

export class GetPostDto {
  @IsMongoId()
  id: string;
}
