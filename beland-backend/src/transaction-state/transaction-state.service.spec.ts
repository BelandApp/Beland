import { Test, TestingModule } from '@nestjs/testing';
import { TransactionStateService } from './transaction-state.service';

describe('TransactionStateService', () => {
  let service: TransactionStateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransactionStateService],
    }).compile();

    service = module.get<TransactionStateService>(TransactionStateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
