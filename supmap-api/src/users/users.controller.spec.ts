import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './user.entity/user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let service: Partial<Record<keyof UsersService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      findAllUsers: jest.fn(),
      findUserById: jest.fn(),
      deleteUser:   jest.fn(),
      updateUser:   jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: service },
      ],
    }).compile();

    controller = module.get(UsersController);
  });

  it('getAllUsers returns array from service', async () => {
    const arr = [{ id: 'u1' }] as User[];
    service.findAllUsers!.mockResolvedValue(arr);
    await expect(controller.getAllUsers()).resolves.toEqual(arr);
    expect(service.findAllUsers).toHaveBeenCalled();
  });

  it('getUserById returns one user', async () => {
    const u = { id: 'xx' } as User;
    service.findUserById!.mockResolvedValue(u);
    await expect(controller.getUserById('xx')).resolves.toEqual(u);
    expect(service.findUserById).toHaveBeenCalledWith('xx');
  });

  it('deleteUser calls service.deleteUser', async () => {
    service.deleteUser!.mockResolvedValue(undefined);
    await expect(controller.deleteUser('id')).resolves.toBeUndefined();
    expect(service.deleteUser).toHaveBeenCalledWith('id');
  });

  it('updateUser calls service.updateUser', async () => {
    const updated = { id: 'id', username: 'new' } as User;
    service.updateUser!.mockResolvedValue(updated);
    const body = { username: 'new' };
    await expect(controller.updateUser('id', body)).resolves.toEqual(updated);
    expect(service.updateUser).toHaveBeenCalledWith('id', body);
  });
});
