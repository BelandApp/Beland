import { Test, TestingModule } from '@nestjs/testing';
import { PresetAmountService } from './preset-amount.service';

describe('PresetAmountService', () => {
  let service: PresetAmountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PresetAmountService],
    }).compile();

    service = module.get<PresetAmountService>(PresetAmountService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
