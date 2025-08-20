import { Test, TestingModule } from '@nestjs/testing';
import { UserResourcesController } from './user-resources.controller';
import { UserResourcesService } from './user-resources.service';

describe('UserResourcesController', () => {
  let controller: UserResourcesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserResourcesController],
      providers: [UserResourcesService],
    }).compile();

    controller = module.get<UserResourcesController>(UserResourcesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
