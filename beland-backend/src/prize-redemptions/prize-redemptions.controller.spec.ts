import { Test, TestingModule } from '@nestjs/testing';
import { PrizeRedemptionsController } from './prize-redemptions.controller';
import { PrizeRedemptionsService } from './prize-redemptions.service';

describe('PrizeRedemptionsController', () => {
  let controller: PrizeRedemptionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrizeRedemptionsController],
      providers: [PrizeRedemptionsService],
    }).compile();

    controller = module.get<PrizeRedemptionsController>(PrizeRedemptionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
