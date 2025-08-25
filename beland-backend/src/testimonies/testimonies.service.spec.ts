import { Test, TestingModule } from '@nestjs/testing';
import { TestimoniesService } from './testimonies.service';

describe('TestimoniesService', () => {
  let service: TestimoniesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TestimoniesService],
    }).compile();

    service = module.get<TestimoniesService>(TestimoniesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
