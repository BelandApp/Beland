import { Test, TestingModule } from '@nestjs/testing';
import { PresetAmountController } from './preset-amount.controller';
import { PresetAmountService } from './preset-amount.service';

describe('PresetAmountController', () => {
  let controller: PresetAmountController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PresetAmountController],
      providers: [PresetAmountService],
    }).compile();

    controller = module.get<PresetAmountController>(PresetAmountController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
