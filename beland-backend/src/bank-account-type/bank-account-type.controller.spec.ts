import { Test, TestingModule } from '@nestjs/testing';
import { BankAccountTypeController } from './bank-account-type.controller';
import { BankAccountTypeService } from './bank-account-type.service';

describe('BankAccountTypeController', () => {
  let controller: BankAccountTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BankAccountTypeController],
      providers: [BankAccountTypeService],
    }).compile();

    controller = module.get<BankAccountTypeController>(BankAccountTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
