import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { ICreateUserModel } from '../models/create-user.model';
import { Role } from '../enums/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async create(data: ICreateUserModel): Promise<UserEntity> {
    const user = this.usersRepository.create({
      email: data.email,
      fullName: data.fullName,
      password: data.password,
      role: data.role ?? Role.USER,
    });
    return this.usersRepository.save(user);
  }

  async updateRefreshToken(
    id: string,
    refreshToken: string | null,
  ): Promise<void> {
    await this.usersRepository.update({ id }, { refreshToken });
  }

  async updatePassword(id: string, password: string): Promise<void> {
    await this.usersRepository.update({ id }, { password, refreshToken: null });
  }

  async markLoggedIn(id: string): Promise<void> {
    await this.usersRepository.update({ id }, { lastLoginAt: new Date() });
  }
}
