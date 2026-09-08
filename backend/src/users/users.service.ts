import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  private sanitizeUser(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }

  async findAll() {
    const users = await this.usersRepository.find({
      order: {
        id: 'ASC',
      },
    });

    return users.map((user) => this.sanitizeUser(user));
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
    });
  }

  async create(user: Partial<User>): Promise<User> {
    const newUser = this.usersRepository.create(user);

    return this.usersRepository.save(newUser);
  }

  async createManagedUser(
    name: string,
    email: string,
    password: string,
    role: string,
  ) {
    const existingUser = await this.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.usersRepository.save(
      this.usersRepository.create({
        name,
        email,
        password: hashedPassword,
        role,
        isActive: true,
      }),
    );

    return this.sanitizeUser(user);
  }

  async updateUser(
    id: number,
    data: {
      name?: string;
      email?: string;
      role?: string;
    },
  ) {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (data.email && data.email !== user.email) {
      const existingUser = await this.findByEmail(data.email);

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email is already registered');
      }
    }

    Object.assign(user, data);

    const updatedUser = await this.usersRepository.save(user);

    return this.sanitizeUser(updatedUser);
  }

  async changePassword(id: number, password: string) {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.password = await bcrypt.hash(password, 10);

    await this.usersRepository.save(user);

    return {
      message: 'Password changed successfully',
    };
  }

  async setActiveStatus(id: number, isActive: boolean) {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isActive = isActive;

    const updatedUser = await this.usersRepository.save(user);

    return this.sanitizeUser(updatedUser);
  }

  async removeUser(id: number) {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.usersRepository.remove(user);

    return {
      message: 'User deleted successfully',
    };
  }
}
