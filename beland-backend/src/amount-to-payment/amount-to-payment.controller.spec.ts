import { Test, TestingModule } from '@nestjs/testing';
import { AmountToPaymentsController } from './amount-to-payment.controller';
import { AmountToPaymentsService } from './amount-to-payment.service';

describe('AmountToPaymentController', () => {
  let controller: AmountToPaymentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AmountToPaymentsController],
      providers: [AmountToPaymentsService],
    }).compile();

    controller = module.get<AmountToPaymentsController>(AmountToPaymentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
