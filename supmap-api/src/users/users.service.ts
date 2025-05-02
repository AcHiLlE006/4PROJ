import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity/user.entity';
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

  async createUser(username: string,
                    email: string,
                    plainPassword: string,
                    role: UserRole = UserRole.USER): Promise<User> {

    const hash = await bcrypt.hash(plainPassword, 10);
    const user = this.usersRepo.create({username, email, password: hash, role });
    return this.usersRepo.save(user);
  }

  async findAllUsers(): Promise<User[]> {
    return this.usersRepo.find();
  }
  async findUserById(id: string): Promise<User | undefined> {
    const user = await this.usersRepo.findOne({ where: { id } });
    return user ?? undefined;
  }
  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    await this.usersRepo.update(id, userData);
    const updatedUser = await this.findUserById(id);
    if (!updatedUser) {
      throw new Error(`User with ID ${id} not found`);
    }
    return updatedUser;
  }
  async deleteUser(id: string): Promise<void> {
    await this.usersRepo.delete(id);
  }

}
