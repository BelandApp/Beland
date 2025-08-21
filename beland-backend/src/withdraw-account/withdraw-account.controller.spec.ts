import { Test, TestingModule } from '@nestjs/testing';
import { WithdrawAccountController } from './withdraw-account.controller';
import { WithdrawAccountService } from './withdraw-account.service';

describe('WithdrawAccountController', () => {
  let controller: WithdrawAccountController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WithdrawAccountController],
      providers: [WithdrawAccountService],
    }).compile();

    controller = module.get<WithdrawAccountController>(WithdrawAccountController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
