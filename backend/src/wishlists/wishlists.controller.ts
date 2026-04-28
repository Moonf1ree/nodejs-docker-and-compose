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
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { WishlistsService } from './wishlists.service';

@UseGuards(JwtAuthGuard)
@Controller('wishlists')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Post()
  async createWishlist(
    @Body() createWishlistDto: CreateWishlistDto,
    @CurrentUser() currentUser: RequestUser,
  ) {
    const wishlist = await this.wishlistsService.create(
      createWishlistDto,
      currentUser,
    );
    return this.wishlistsService.sanitizeWishlist(wishlist);
  }

  @Get()
  async getWishlists() {
    const wishlists = await this.wishlistsService.findMany();
    return wishlists.map((wishlist) =>
      this.wishlistsService.sanitizeWishlist(wishlist),
    );
  }

  @Get(':id')
  async getWishlistById(@Param('id', ParseIntPipe) id: number) {
    const wishlist = await this.wishlistsService.findOne({ id });
    return this.wishlistsService.sanitizeWishlist(wishlist);
  }

  @Patch(':id')
  async updateWishlist(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: RequestUser,
    @Body() updateWishlistDto: UpdateWishlistDto,
  ) {
    const wishlist = await this.wishlistsService.updateOwnedWishlist(
      id,
      currentUser,
      updateWishlistDto,
    );

    return this.wishlistsService.sanitizeWishlist(wishlist);
  }

  @Delete(':id')
  async deleteWishlist(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: RequestUser,
  ) {
    await this.wishlistsService.deleteOwnedWishlist(id, currentUser);
    return { message: 'Подборка удалена' };
  }
}
