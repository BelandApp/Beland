import { Test, TestingModule } from '@nestjs/testing';
import { TypeBankAccountService } from './type-bank-account.service';

describe('TypeBankAccountService', () => {
  let service: TypeBankAccountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TypeBankAccountService],
    }).compile();

    service = module.get<TypeBankAccountService>(TypeBankAccountService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
