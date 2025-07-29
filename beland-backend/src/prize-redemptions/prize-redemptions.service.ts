import { Injectable } from '@nestjs/common';
import { CreatePrizeRedemptionDto } from './dto/create-prize-redemption.dto';
import { UpdatePrizeRedemptionDto } from './dto/update-prize-redemption.dto';

@Injectable()
export class PrizeRedemptionsService {
  create(createPrizeRedemptionDto: CreatePrizeRedemptionDto) {
    return 'This action adds a new prizeRedemption';
  }

  findAll() {
    return `This action returns all prizeRedemptions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} prizeRedemption`;
  }

  update(id: number, updatePrizeRedemptionDto: UpdatePrizeRedemptionDto) {
    return `This action updates a #${id} prizeRedemption`;
  }

  remove(id: number) {
    return `This action removes a #${id} prizeRedemption`;
  }
}
