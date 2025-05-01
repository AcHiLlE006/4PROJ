import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register/register.dto';
import { LoginDto } from './dto/login/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // Vérifier si l'email existe déjà
    const exists = await this.usersService.findByEmail(dto.email);
    if (exists) throw new ConflictException('Email déjà utilisé');

    // Création de l'utilisateur (hash du mot de passe dans UsersService)
    const user = await this.usersService.createUser(dto.username, dto.email, dto.password);
    // Optionnel : retourner directement un token
    const payload = { sub: user.id, email: user.email, role: user.role };
    return { access_token: this.jwtService.sign(payload) };
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);
    const payload = { sub: user.id, email: user.email, role: user.role };
    return { access_token: this.jwtService.sign(payload) };
  }

  public async validateUser(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Identifiants invalides');
    const match = await bcrypt.compare(pass, user.password);
    if (!match) throw new UnauthorizedException('Identifiants invalides');
    return user;
  }
}
