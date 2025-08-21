import { Test, TestingModule } from '@nestjs/testing';
import { WithdrawAccountTypeController } from './withdraw-account-type.controller';
import { WithdrawAccountTypeService } from './withdraw-account-type.service';

describe('WithdrawAccountTypeController', () => {
  let controller: WithdrawAccountTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WithdrawAccountTypeController],
      providers: [WithdrawAccountTypeService],
    }).compile();

    controller = module.get<WithdrawAccountTypeController>(WithdrawAccountTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
