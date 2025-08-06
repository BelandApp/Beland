import { Test, TestingModule } from '@nestjs/testing';
import { CharityController } from './charity.controller';
import { CharityService } from './charity.service';

describe('CharityController', () => {
  let controller: CharityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CharityController],
      providers: [CharityService],
    }).compile();

    controller = module.get<CharityController>(CharityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
