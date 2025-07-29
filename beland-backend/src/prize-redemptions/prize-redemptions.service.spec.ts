import { Test, TestingModule } from '@nestjs/testing';
import { PrizeRedemptionsService } from './prize-redemptions.service';

describe('PrizeRedemptionsService', () => {
  let service: PrizeRedemptionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrizeRedemptionsService],
    }).compile();

    service = module.get<PrizeRedemptionsService>(PrizeRedemptionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
