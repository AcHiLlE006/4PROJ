import { Test, TestingModule } from '@nestjs/testing';
import { BreService } from './bre.service';

describe('BreService', () => {
  let service: BreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BreService],
    }).compile();

    service = module.get<BreService>(BreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
