import { Test, TestingModule } from '@nestjs/testing';
import { RecycledItemsService } from './recycled-items.service';

describe('RecycledItemsService', () => {
  let service: RecycledItemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecycledItemsService],
    }).compile();

    service = module.get<RecycledItemsService>(RecycledItemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
