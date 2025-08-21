import { Test, TestingModule } from '@nestjs/testing';
import { UserResourcesService } from './user-resources.service';

describe('UserResourcesService', () => {
  let service: UserResourcesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserResourcesService],
    }).compile();

    service = module.get<UserResourcesService>(UserResourcesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
