import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtGuard } from './guards/jwt.guard';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: Partial<Record<keyof AuthService, jest.Mock>>;

  beforeEach(async () => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
      ],
    }).overrideGuard(JwtGuard).useValue({ canActivate: () => true })
    .compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('register', () => {
    it('should return success message on valid registration', async () => {
      authService.register!.mockResolvedValue({ access_token: 'test_token' });

      const dto: RegisterDto = { email: 'test@test.com', username: 'user', password: 'pass' };
      const result = await controller.register(dto);

      expect(result).toEqual({
        message: 'Utilisateur créé',
        body: { access_token: 'test_token' },
      });
    });

    it('should return error message if registration fails', async () => {
      authService.register!.mockResolvedValue(null);

      const dto: RegisterDto = { email: 'test@test.com', username: 'user', password: 'pass' };
      const result = await controller.register(dto);

      expect(result).toEqual({
        message: "Erreur lors de la création de l'utilisateur",
      });
    });
  });

  describe('login', () => {
    it('should return a token on valid login', async () => {
      authService.login!.mockResolvedValue({ access_token: 'jwt_token' });

      const dto: LoginDto = { email: 'test@test.com', password: 'pass' };
      const result = await controller.login(dto);

      expect(result).toEqual({ access_token: 'jwt_token' });
    });
  });

  describe('profile', () => {
    it('should return user from request', () => {
      const mockRequest = { user: { id: 1, email: 'user@test.com' } };
      const controllerInstance: any = controller;
      controllerInstance.getProfile = (req: any) => req.user;

      const result = controllerInstance.getProfile(mockRequest);
      expect(result).toEqual({ id: 1, email: 'user@test.com' });
    });
  });
});
