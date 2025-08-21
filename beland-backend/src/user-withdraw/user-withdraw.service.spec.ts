import { Test, TestingModule } from '@nestjs/testing';
import { UserWithdrawService } from './user-withdraw.service';

describe('UserWithdrawService', () => {
  let service: UserWithdrawService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserWithdrawService],
    }).compile();

    service = module.get<UserWithdrawService>(UserWithdrawService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
