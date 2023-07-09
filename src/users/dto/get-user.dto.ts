import { IsMongoId, IsOptional } from 'class-validator';

export class GetUserDTO {
  @IsMongoId()
  @IsOptional()
  id?: string;

  @IsOptional()
  username?: string;
}
