import { PartialType } from '@nestjs/mapped-types';
import { CreateWalletTypeDto } from './create-wallet-type.dto';

export class UpdateWalletTypeDto extends PartialType(CreateWalletTypeDto) {}
