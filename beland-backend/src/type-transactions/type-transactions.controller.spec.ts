import { Test, TestingModule } from '@nestjs/testing';
import { TypeTransactionsController } from './type-transactions.controller';
import { TypeTransactionsService } from './type-transactions.service';

describe('TypeTransactionsController', () => {
  let controller: TypeTransactionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TypeTransactionsController],
      providers: [TypeTransactionsService],
    }).compile();

    controller = module.get<TypeTransactionsController>(TypeTransactionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
