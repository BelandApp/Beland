import { Test, TestingModule } from '@nestjs/testing';
import { WithdrawAccountService } from './withdraw-account.service';

describe('WithdrawAccountService', () => {
  let service: WithdrawAccountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WithdrawAccountService],
    }).compile();

    service = module.get<WithdrawAccountService>(WithdrawAccountService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
