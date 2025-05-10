import { Injectable } from '@nestjs/common';

// Define or import GeoPosition type
export interface GeoPosition {
  latitude: number;
  longitude: number;
}
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
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
    const user = this.usersRepo.create({username, email, password: hash, role ,preferences: { avoid_highways: false }});
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

  /** Récupère uniquement les préférences */
  async getPreferences(id: string): Promise<any> {
    const user = await this.findUserById(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    const { preferences } = user;
    return preferences;
  }

  /** Met à jour les préférences (patch) */
  async updatePreferences(id: string, prefs: any): Promise<any> {
    await this.usersRepo.update(id, { preferences: prefs } as DeepPartial<User>);
    const updated = await this.findUserById(id);
    if (!updated) {
      throw new Error(`User with ID ${id} not found`);
    }
    return updated.preferences;
  }

  /** Récupère la position actuelle */
  async getPosition(id: string): Promise<GeoPosition | null> {
    const user = await this.findUserById(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    const { position } = user;
    return position;
  }

  /** Met à jour la position */
  async updatePosition(id: string, pos: GeoPosition): Promise<GeoPosition | null> {
    await this.usersRepo.update(id, { position: pos } as DeepPartial<User>);
    const updated = await this.findUserById(id);
    if (!updated) {
      throw new Error(`User with ID ${id} not found`);
    }
    return updated.position;
  }

}
