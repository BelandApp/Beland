import { Test, TestingModule } from '@nestjs/testing';
import { RecycledItemsController } from './recycled-items.controller';
import { RecycledItemsService } from './recycled-items.service';

describe('RecycledItemsController', () => {
  let controller: RecycledItemsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecycledItemsController],
      providers: [RecycledItemsService],
    }).compile();

    controller = module.get<RecycledItemsController>(RecycledItemsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
