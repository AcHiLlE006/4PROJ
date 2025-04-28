import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../model/users.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.usersRepo.findOne({ where: { email } });
    return user ?? undefined;
  }

  async createUser(email: string, plainPassword: string, role: UserRole = UserRole.USER): Promise<User> {
    const hash = await bcrypt.hash(plainPassword, 10);
    const user = this.usersRepo.create({ email, password: hash, role });
    return this.usersRepo.save(user);
  }

    async findById(id: string): Promise<User | undefined> {
        const user = await this.usersRepo.findOne({ where: { id } });
        return user ?? undefined;
    }

    async updateUser(id: string, email: string, role: UserRole): Promise<User | undefined> {
        const user = await this.findById(id);
        if (!user) return undefined;
        user.email = email;
        user.role = role;
        return this.usersRepo.save(user);
    }

    async deleteUser(id: string): Promise<void> {
        await this.usersRepo.delete(id);
    }

}
