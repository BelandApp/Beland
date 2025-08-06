import { Test, TestingModule } from '@nestjs/testing';
import { TransactionStateController } from './transaction-state.controller';
import { TransactionStateService } from './transaction-state.service';

describe('TransactionStateController', () => {
  let controller: TransactionStateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionStateController],
      providers: [TransactionStateService],
    }).compile();

    controller = module.get<TransactionStateController>(TransactionStateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
