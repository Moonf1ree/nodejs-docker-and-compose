import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/types/request-user.interface';
import { FindUsersDto } from './dto/find-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@CurrentUser() currentUser: RequestUser) {
    const user = await this.usersService.findOne({ id: currentUser.id });
    return this.usersService.toPublic(user, true);
  }

  @Patch('me')
  async updateMe(
    @CurrentUser() currentUser: RequestUser,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersService.updateOne(
      { id: currentUser.id },
      updateUserDto,
    );
    return this.usersService.toPublic(user, true);
  }

  @Post('find')
  async findUsers(@Body() findUsersDto: FindUsersDto) {
    const users = await this.usersService.findByUsernameOrEmail(
      findUsersDto.query,
    );
    return users.map((user) => this.usersService.toPublic(user, false));
  }

  @Get(':username')
  async getByUsername(@Param('username') username: string) {
    const user = await this.usersService.findOne({ username });
    return this.usersService.toPublic(user, false);
  }
}
