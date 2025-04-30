import { Controller, Post, UseGuards, Request, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalGuard } from './guards/local/local.guard';
import { JwtGuard } from './guards/jwt/jwt.guard';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private usersService: UsersService) {}

  @Post('signup')
  async signUp(@Body() body: { email: string; password: string }) {

    const { email, password } = body;

    const user = await this.usersService.createUser(email, password);
    if (!user) {
      return { message: 'Erreur lors de la création de l\'utilisateur' };
    }
    return { message: 'Utilisateur créé', body: user};
  }

  @UseGuards(LocalGuard)
  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.validateUser(body.email, body.password);
  }

  @UseGuards(JwtGuard)
  @Post('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  // OAuth2 routes
  @Get('google')
  async googleAuth() {}

  @Get('google/redirect')
  googleAuthRedirect(@Request() req) {
    return this.authService.login(req.user);
  }

  // idem pour Facebook...
}
