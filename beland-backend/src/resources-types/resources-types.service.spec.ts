import { Test, TestingModule } from '@nestjs/testing';
import { ResourcesTypesService } from './resources-types.service';

describe('ResourcesTypesService', () => {
  let service: ResourcesTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResourcesTypesService],
    }).compile();

    service = module.get<ResourcesTypesService>(ResourcesTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
