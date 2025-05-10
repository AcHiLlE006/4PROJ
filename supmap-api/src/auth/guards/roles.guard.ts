import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator/roles.decorator';
import { UserRole } from '../../users/user.entity/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<UserRole[]>(
      ROLES_KEY,
      ctx.getHandler(),
    );
    // Si aucune restriction, on autorise
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = ctx.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException('Utilisateur non authentifié');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Accès refusé : rôles autorisés [${requiredRoles.join(
          ', ',
        )}], rôle actuel : ${user.role}`,
      );
    }

    return true;
  }
}
