import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../users/user.entity/user.entity';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<Record<keyof UsersService, jest.Mock>>;
  let jwtService: Partial<Record<keyof JwtService, jest.Mock>>;

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      createUser: jest.fn(),
    };

    jwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should throw if email already exists', async () => {
      usersService.findByEmail!.mockResolvedValue({ id: 1 });
      await expect(authService.register({ email: 'test@test.com' } as any)).rejects.toThrow(ConflictException);
    });

    it('should register and return a token', async () => {
      usersService.findByEmail!.mockResolvedValue(null);
      usersService.createUser!.mockResolvedValue({ id: 1, email: 'test@test.com', role: 'user' });
      jwtService.sign!.mockReturnValue('jwt_token');

      const result = await authService.register({ email: 'test@test.com', username: 'test', password: 'pass' } as any);
      expect(result.access_token).toBe('jwt_token');
    });
  });

  describe('login', () => {
    it('should return token on valid credentials', async () => {
      jest.spyOn(authService, 'validateUser').mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        role: 'User' as UserRole,
        username: 'testuser',
        password: 'hashedpassword',
        position: { latitude: 0, longitude: 0 },
        preferences: {avoid_highways: false},
      });
      jwtService.sign!.mockReturnValue('jwt_token');

      const result = await authService.login({ email: 'test@test.com', password: 'pass' } as any);
      expect(result.access_token).toBe('jwt_token');
    });

    it('should throw on invalid credentials', async () => {
      jest.spyOn(authService, 'validateUser').mockRejectedValue(new UnauthorizedException());
      await expect(authService.login({ email: 'bad@test.com', password: 'wrong' } as any)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    it('should throw if user not found', async () => {
      usersService.findByEmail!.mockResolvedValue(null);
      await expect(authService.validateUser('none@test.com', 'pass')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if password does not match', async () => {
      usersService.findByEmail!.mockResolvedValue({ password: await bcrypt.hash('realpass', 10) });
      await expect(authService.validateUser('user@test.com', 'wrong')).rejects.toThrow(UnauthorizedException);
    });

    it('should return user if credentials valid', async () => {
      const hashed = await bcrypt.hash('pass', 10);
      const user = { id: 1, email: 'user@test.com', password: hashed, role: 'user' };
      usersService.findByEmail!.mockResolvedValue(user);

      const result = await authService.validateUser('user@test.com', 'pass');
      expect(result).toMatchObject({ id: 1, email: 'user@test.com' });
    });
  });
});
