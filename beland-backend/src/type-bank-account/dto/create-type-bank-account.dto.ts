import { IsString } from "class-validator";

export class CreateTypeBankAccountDto {

    @IsString()
      type_account: string;
}
