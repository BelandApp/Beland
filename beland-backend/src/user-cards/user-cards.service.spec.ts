import { Test, TestingModule } from '@nestjs/testing';
import { UserCardsService } from './user-cards.service';

describe('UserCardsService', () => {
  let service: UserCardsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserCardsService],
    }).compile();

    service = module.get<UserCardsService>(UserCardsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
