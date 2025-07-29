import { Test, TestingModule } from '@nestjs/testing';
import { PrizesController } from './prizes.controller';
import { PrizesService } from './prizes.service';

describe('PrizesController', () => {
  let controller: PrizesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrizesController],
      providers: [PrizesService],
    }).compile();

    controller = module.get<PrizesController>(PrizesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
