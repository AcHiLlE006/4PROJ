import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService, GeoPosition } from './users.service';
import { User, UserRole } from './user.entity/user.entity';

import { ObjectLiteral } from 'typeorm';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

type MockRepo<T extends ObjectLiteral = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UsersService', () => {
  let service: UsersService;
  let repo: MockRepo<User>;

  beforeEach(async () => {
    repo = {
      findOne: jest.fn(),
      create:  jest.fn(),
      save:    jest.fn(),
      find:    jest.fn(),
      update:  jest.fn(),
      delete:  jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: repo },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  describe('findByEmail', () => {
    it('should return user when found', async () => {
      const user = { id: '1', email: 'a@b', username: 'u' } as User;
      repo.findOne!.mockResolvedValue(user);

      await expect(service.findByEmail('a@b')).resolves.toEqual(user);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { email: 'a@b' } });
    });

    it('should return undefined when not found', async () => {
      repo.findOne!.mockResolvedValue(null);
      await expect(service.findByEmail('x@y')).resolves.toBeUndefined();
    });
  });

  describe('createUser', () => {
    it('should hash password and save user', async () => {
      const dto = { username: 'u', email: 'e@e', plainPassword: 'pass' };
      const hashed: string = 'hashed-pass';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashed);
      const created = { 
        ...dto, 
        password: hashed, 
        role: UserRole.USER, 
        id: 'generated-id', // Replace with actual id generation logic if needed
        position: { latitude: 0, longitude: 0 }, // Default position
        preferences: { avoid_highways: false } // Default preferences
      } as User;
      repo.create!.mockReturnValue(created);
      repo.save!.mockResolvedValue(created);

      const result = await service.createUser(dto.username, dto.email, dto.plainPassword);
      expect(bcrypt.hash).toHaveBeenCalledWith('pass', 10);
      expect(repo.create).toHaveBeenCalledWith({
        username: dto.username,
        email: dto.email,
        password: hashed,
        role: UserRole.USER,
        preferences: { avoid_highways: false },
      });
      expect(result).toEqual(created);
    });
  });

  describe('findAllUsers', () => {
    it('returns array of users', async () => {
      const arr = [{ id: '1' }] as User[];
      repo.find!.mockResolvedValue(arr);
      await expect(service.findAllUsers()).resolves.toEqual(arr);
    });
  });

  describe('findUserById', () => {
    it('returns user when exists', async () => {
      const u = { id: '42' } as User;
      repo.findOne!.mockResolvedValue(u);
      await expect(service.findUserById('42')).resolves.toEqual(u);
    });

    it('returns undefined when not exists', async () => {
      repo.findOne!.mockResolvedValue(null);
      await expect(service.findUserById('99')).resolves.toBeUndefined();
    });
  });

  describe('updateUser', () => {
    it('updates and returns updated user', async () => {
      const updated = { id: '10', username: 'new' } as User;

      repo.findOne!.mockResolvedValue(updated);

      await expect(service.updateUser('10', { username: 'new' })).resolves.toEqual(updated);
      expect(repo.update).toHaveBeenCalledWith('10', { username: 'new' });
    });

    it('throws if user not found after update', async () => {
      repo.findOne!.mockResolvedValueOnce(null);
      await expect(service.updateUser('nope', {})).rejects.toThrowError(/not found/i);
    });
  });

  describe('deleteUser', () => {
    it('calls delete on repo', async () => {
      await service.deleteUser('5');
      expect(repo.delete).toHaveBeenCalledWith('5');
    });
  });

  describe('getPreferences & updatePreferences', () => {
    const prefs = { avoid_highways: true };
    it('getPreferences returns prefs', async () => {
      repo.findOne!.mockResolvedValue({ id: '1', preferences: prefs } as User);
      await expect(service.getPreferences('1')).resolves.toEqual(prefs);
    });

    it('updatePreferences patches and returns new prefs', async () => {
      const newPrefs = { avoid_highways: true, extra: 1 };
      const user = { 
        id: '2', 
        username: 'testUser', 
        email: 'test@example.com', 
        password: 'hashedPassword', 
        position: { latitude: 0, longitude: 0 }, 
        role: UserRole.USER, 
        preferences: newPrefs 
      } as User;
      repo.update!.mockResolvedValue(undefined);
      repo.findOne!.mockResolvedValue(user);

      await expect(service.updatePreferences('2', newPrefs)).resolves.toEqual(newPrefs);
      expect(repo.update).toHaveBeenCalledWith('2', { preferences: newPrefs });
    });

    it('throws if user not found', async () => {
      repo.findOne!.mockResolvedValue(null);
      await expect(service.getPreferences('x')).rejects.toThrow(/not found/i);
    });
  });

  describe('getPosition & updatePosition', () => {
    const pos: GeoPosition = { latitude: 1, longitude: 2 };
    it('getPosition returns position', async () => {
      repo.findOne!.mockResolvedValue({ id: '1', position: pos } as User);
      await expect(service.getPosition('1')).resolves.toEqual(pos);
    });

    it('updatePosition patches and returns new pos', async () => {
      repo.update!.mockResolvedValue(undefined);
      repo.findOne!.mockResolvedValue({ id: '3', position: pos } as User);

      await expect(service.updatePosition('3', pos)).resolves.toEqual(pos);
      expect(repo.update).toHaveBeenCalledWith('3', { position: pos });
    });

    it('throws if user missing', async () => {
      repo.findOne!.mockResolvedValue(null);
      await expect(service.getPosition('no')).rejects.toThrow(/not found/i);
    });
  });
});
