import { Test, TestingModule } from '@nestjs/testing';
import { RoutesController }     from './routes.controller';
import { RoutesService }        from './routes.service';
import { CreateRouteDto }       from './dto/create-route.dto';

describe('RoutesController (unit)', () => {
  let controller: RoutesController;
  let service: Partial<RoutesService>;

  beforeEach(async () => {
    service = {
      createRoute: jest.fn(),
      findAll:     jest.fn(),
      findOne:     jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoutesController],
      providers: [
        { provide: RoutesService, useValue: service },
      ],
    }).compile();

    controller = module.get<RoutesController>(RoutesController);
  });

  it('POST /routes calls createRoute', async () => {
    const dto: CreateRouteDto = {
      originLat:  1, originLon: 2,
      destinationLat: 3, destinationLon: 4,
    };
    const fake = [{ foo: 'bar' }];
    (service.createRoute as jest.Mock).mockResolvedValue(fake);

    const req = { user: { userId: 'u1' } } as any;
    await expect(controller.create(req, dto)).resolves.toBe(fake);
    expect(service.createRoute).toHaveBeenCalledWith('u1', dto);
  });

  it('GET /routes calls findAll', async () => {
    const fake = [{ id: 'r' }];
    (service.findAll as jest.Mock).mockResolvedValue(fake);

    await expect(controller.list()).resolves.toBe(fake);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('GET /routes/:id calls findOne', async () => {
    const fake = { id: 'R1' } as any;
    (service.findOne as jest.Mock).mockResolvedValue(fake);

    await expect(controller.one('R1')).resolves.toBe(fake);
    expect(service.findOne).toHaveBeenCalledWith('R1');
  });
});
