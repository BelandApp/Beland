import { Test, TestingModule } from '@nestjs/testing';
import { UserWithdrawsController } from './user-withdraw.controller';
import { UserWithdrawsService } from './user-withdraw.service';

describe('UserWithdrawController', () => {
  let controller: UserWithdrawsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserWithdrawsController],
      providers: [UserWithdrawsService],
    }).compile();

    controller = module.get<UserWithdrawsController>(UserWithdrawsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
