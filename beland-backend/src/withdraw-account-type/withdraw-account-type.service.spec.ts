import { Test, TestingModule } from '@nestjs/testing';
import { WithdrawAccountTypeService } from './withdraw-account-type.service';

describe('WithdrawAccountTypeService', () => {
  let service: WithdrawAccountTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WithdrawAccountTypeService],
    }).compile();

    service = module.get<WithdrawAccountTypeService>(WithdrawAccountTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
