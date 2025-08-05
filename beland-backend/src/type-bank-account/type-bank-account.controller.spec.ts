import { Test, TestingModule } from '@nestjs/testing';
import { TypeBankAccountController } from './type-bank-account.controller';
import { TypeBankAccountService } from './type-bank-account.service';

describe('TypeBankAccountController', () => {
  let controller: TypeBankAccountController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TypeBankAccountController],
      providers: [TypeBankAccountService],
    }).compile();

    controller = module.get<TypeBankAccountController>(TypeBankAccountController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
