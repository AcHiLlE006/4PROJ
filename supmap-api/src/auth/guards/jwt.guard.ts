// src/auth/guards/jwt/jwt.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'] as string;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token manquant');
    }

    const token = authHeader.slice(7); // enlève "Bearer "
    try {
      const payload = this.jwtService.verify(token);
      // Attache payload à req.user pour le controller
      req.user = payload;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Token invalide');
    }
  }
}
