import { Test, TestingModule } from '@nestjs/testing';
import { AmountToPaymentService } from './amount-to-payment.service';

describe('AmountToPaymentService', () => {
  let service: AmountToPaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AmountToPaymentService],
    }).compile();

    service = module.get<AmountToPaymentService>(AmountToPaymentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
