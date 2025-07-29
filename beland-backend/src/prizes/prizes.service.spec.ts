import { Test, TestingModule } from '@nestjs/testing';
import { PrizesService } from './prizes.service';

describe('PrizesService', () => {
  let service: PrizesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrizesService],
    }).compile();

    service = module.get<PrizesService>(PrizesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
