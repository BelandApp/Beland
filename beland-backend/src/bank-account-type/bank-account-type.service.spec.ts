import { Test, TestingModule } from '@nestjs/testing';
import { BankAccountTypeService } from './bank-account-type.service';

describe('BankAccountTypeService', () => {
  let service: BankAccountTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BankAccountTypeService],
    }).compile();

    service = module.get<BankAccountTypeService>(BankAccountTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
