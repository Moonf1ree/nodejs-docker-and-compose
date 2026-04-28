import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/types/request-user.interface';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { WishesService } from './wishes.service';

@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @Get('last')
  async getLastWishes() {
    const wishes = await this.wishesService.findMany({
      order: { createdAt: 'DESC' },
      take: 40,
    });

    return wishes.map((wish) => this.wishesService.sanitizeWish(wish, false));
  }

  @Get('top')
  async getTopWishes() {
    const wishes = await this.wishesService.findMany({
      order: { copied: 'DESC' },
      take: 20,
    });

    return wishes.map((wish) => this.wishesService.sanitizeWish(wish, false));
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createWish(
    @Body() createWishDto: CreateWishDto,
    @CurrentUser() currentUser: RequestUser,
  ) {
    const wish = await this.wishesService.create(createWishDto, currentUser);
    return this.wishesService.sanitizeWish(wish, false);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getWishById(@Param('id', ParseIntPipe) id: number) {
    const wish = await this.wishesService.findOne({ id });
    return this.wishesService.sanitizeWish(wish, true);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateWish(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: RequestUser,
    @Body() updateWishDto: UpdateWishDto,
  ) {
    const wish = await this.wishesService.updateOwnedWish(
      id,
      currentUser,
      updateWishDto,
    );
    return this.wishesService.sanitizeWish(wish, true);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteWish(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: RequestUser,
  ) {
    await this.wishesService.deleteOwnedWish(id, currentUser);
    return { message: 'Подарок удален' };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/copy')
  async copyWish(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: RequestUser,
  ) {
    const wish = await this.wishesService.copyWish(id, currentUser);
    return this.wishesService.sanitizeWish(wish, false);
  }
}
