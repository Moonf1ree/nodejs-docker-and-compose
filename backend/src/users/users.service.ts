import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  ILike,
  Repository,
} from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly saltRounds = 10;

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      this.saltRounds,
    );

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    try {
      return await this.usersRepository.save(user);
    } catch {
      throw new ConflictException(
        'Пользователь с таким email или username уже существует',
      );
    }
  }

  async findOne(
    where: FindOptionsWhere<User>,
    withPassword = false,
  ): Promise<User> {
    const options: FindOneOptions<User> = {
      where,
      select: withPassword
        ? {
            id: true,
            username: true,
            about: true,
            avatar: true,
            email: true,
            password: true,
            createdAt: true,
            updatedAt: true,
          }
        : undefined,
    };

    const user = await this.usersRepository.findOne(options);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  findMany(options?: FindManyOptions<User>): Promise<User[]> {
    return this.usersRepository.find(options);
  }

  findByUsernameOrEmail(query: string): Promise<User[]> {
    return this.usersRepository.find({
      where: [
        { username: ILike(`%${query}%`) },
        { email: ILike(`%${query}%`) },
      ],
      take: 20,
    });
  }

  async updateOne(
    where: FindOptionsWhere<User>,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.findOne(where, true);

    if (updateUserDto.password) {
      user.password = await bcrypt.hash(
        updateUserDto.password,
        this.saltRounds,
      );
    }

    if (updateUserDto.username) {
      user.username = updateUserDto.username;
    }

    if (updateUserDto.about) {
      user.about = updateUserDto.about;
    }

    if (updateUserDto.avatar) {
      user.avatar = updateUserDto.avatar;
    }

    if (updateUserDto.email) {
      user.email = updateUserDto.email;
    }

    try {
      return await this.usersRepository.save(user);
    } catch {
      throw new ConflictException(
        'Пользователь с таким email или username уже существует',
      );
    }
  }

  async removeOne(where: FindOptionsWhere<User>): Promise<void> {
    const user = await this.findOne(where);
    await this.usersRepository.remove(user);
  }

  toPublic(user: User, includeEmail = false): Record<string, unknown> {
    const rest: Record<string, unknown> = {
      id: user.id,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      username: user.username,
      about: user.about,
      avatar: user.avatar,
    };

    if (includeEmail) {
      return { ...rest, email: user.email };
    }

    return rest;
  }
}
