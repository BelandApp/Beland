// src/prize-redemptions/dto/update-prize-redemption.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreatePrizeRedemptionDto } from './create-prize-redemption.dto';

export class UpdatePrizeRedemptionDto extends PartialType(
  CreatePrizeRedemptionDto,
) {}
