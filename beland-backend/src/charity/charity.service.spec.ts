import { Test, TestingModule } from '@nestjs/testing';
import { CharityService } from './charity.service';

describe('CharityService', () => {
  let service: CharityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CharityService],
    }).compile();

    service = module.get<CharityService>(CharityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
