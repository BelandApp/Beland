import { Test, TestingModule } from '@nestjs/testing';
import { GroupTypeController } from './group-type.controller';
import { GroupTypeService } from './group-type.service';

describe('GroupTypeController', () => {
  let controller: GroupTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupTypeController],
      providers: [GroupTypeService],
    }).compile();

    controller = module.get<GroupTypeController>(GroupTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
