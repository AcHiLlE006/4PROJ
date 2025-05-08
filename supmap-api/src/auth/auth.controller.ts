import { Controller, Post, UseGuards, Request, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalGuard } from './guards/local.guard';
import { JwtGuard } from './guards/jwt.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Créer un utilisateur' })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès.' })
  @ApiResponse({ status: 400, description: 'Erreur lors de la création de l\'utilisateur.' })
  async register(@Body() body: RegisterDto) {

    const user = await this.authService.register(body);
    if (!user) {
      return { message: 'Erreur lors de la création de l\'utilisateur' };
    }
    return { message: 'Utilisateur créé', body: user};
  }

  @Post('login')
  @ApiOperation({ summary: 'Connexion d\'un utilisateur' })
  @ApiResponse({ status: 200, description: 'Connexion réussie.' })
  @ApiResponse({ status: 401, description: 'Identifiants invalides.' })
  async login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @UseGuards(JwtGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Récupérer le profil de l\'utilisateur' })
  @ApiResponse({ status: 200, description: 'Profil récupéré avec succès.' })
  getProfile(@Request() req) {
    const u = req.user as any;
    // on lit d’abord userId, sinon sub, sinon id
    const userId = u.userId ?? u.sub ?? u.id;
    return this.authService.getUserById(userId);
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
