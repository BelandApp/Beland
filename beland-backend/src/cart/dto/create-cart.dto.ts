import { IsUUID } from 'class-validator';

export class CreateCartDto {
  @IsUUID()
  user_id: string;
}