import { AuthService } from 'src/auth/auth.service';
import { LocalStrategy } from './local.strategy';

describe('LocalStrategy', () => {
  it('should be defined', () => {
    const mockAuthService = {} as AuthService;
    expect(new LocalStrategy(mockAuthService)).toBeDefined();
  });
});
