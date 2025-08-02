import { Test, TestingModule } from '@nestjs/testing';
import { TypeTransactionsService } from './type-transactions.service';

describe('TypeTransactionsService', () => {
  let service: TypeTransactionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TypeTransactionsService],
    }).compile();

    service = module.get<TypeTransactionsService>(TypeTransactionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
