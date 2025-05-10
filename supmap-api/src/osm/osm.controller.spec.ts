import { Test, TestingModule } from '@nestjs/testing';
import { OsmController } from './osm.controller';
import { OsmService } from './osm.service';
import { StreamableFile } from '@nestjs/common';

describe('OsmController', () => {
  let controller: OsmController;
  let osmService: Partial<Record<keyof OsmService, jest.Mock>>;

  beforeEach(async () => {
    osmService = {
      getTile:      jest.fn(),
      getRawRoutes: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OsmController],
      providers: [
        { provide: OsmService, useValue: osmService },
      ],
    }).compile();

    controller = module.get(OsmController);
  });

  it('getTile returns StreamableFile of PNG buffer', async () => {
    const buf = Buffer.from([0xFF]);
    (osmService.getTile as jest.Mock).mockResolvedValue(buf);

    const result = await controller.getTile(5, 10, 15);
    expect(osmService.getTile).toHaveBeenCalledWith(5, 10, 15);
    expect(result).toBeInstanceOf(StreamableFile);
    // on peut extraire la donnée via result.getStream().read() si nécessaire
  });

  it('getRawRoutes returns the raw routes array', async () => {
    const fake = [{ a: 1 }];
    (osmService.getRawRoutes as jest.Mock).mockResolvedValue(fake);

    const dto = {
      originLat:  48.8,
      originLon:   2.3,
      destinationLat: 48.9,
      destinationLon: 2.4,
    };
    const result = await controller.getRawRoutes(dto as any);
    expect(osmService.getRawRoutes).toHaveBeenCalledWith({
      origin:      [dto.originLat, dto.originLon],
      destination: [dto.destinationLat, dto.destinationLon],
    });
    expect(result).toBe(fake);
  });
});
