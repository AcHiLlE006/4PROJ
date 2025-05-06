import { Test, TestingModule } from '@nestjs/testing';
import { OsmService } from './osm.service';

describe('OsmService', () => {
  let service: OsmService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OsmService],
    }).compile();

    service = module.get<OsmService>(OsmService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
