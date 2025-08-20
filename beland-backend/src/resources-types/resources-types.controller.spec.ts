import { Test, TestingModule } from '@nestjs/testing';
import { ResourcesTypesController } from './resources-types.controller';
import { ResourcesTypesService } from './resources-types.service';

describe('ResourcesTypesController', () => {
  let controller: ResourcesTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResourcesTypesController],
      providers: [ResourcesTypesService],
    }).compile();

    controller = module.get<ResourcesTypesController>(ResourcesTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
