import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOptionsWhere, In, Repository } from 'typeorm';
import { RequestUser } from '../common/types/request-user.interface';
import { UsersService } from '../users/users.service';
import { WishesService } from '../wishes/wishes.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { Wishlist } from './entities/wishlist.entity';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistsRepository: Repository<Wishlist>,
    private readonly usersService: UsersService,
    private readonly wishesService: WishesService,
  ) {}

  async create(
    createWishlistDto: CreateWishlistDto,
    currentUser: RequestUser,
  ): Promise<Wishlist> {
    const owner = await this.usersService.findOne({ id: currentUser.id });
    const items = await this.wishesService.findMany({
      where: { id: In(createWishlistDto.itemsId) },
    });

    const wishlist = this.wishlistsRepository.create({
      name: createWishlistDto.name,
      description: createWishlistDto.description,
      image: createWishlistDto.image,
      owner,
      items,
    });

    return this.wishlistsRepository.save(wishlist);
  }

  async findOne(where: FindOptionsWhere<Wishlist>): Promise<Wishlist> {
    const wishlist = await this.wishlistsRepository.findOne({ where });

    if (!wishlist) {
      throw new NotFoundException('Подборка не найдена');
    }

    return wishlist;
  }

  findMany(options?: FindManyOptions<Wishlist>): Promise<Wishlist[]> {
    return this.wishlistsRepository.find(options);
  }

  async updateOne(
    where: FindOptionsWhere<Wishlist>,
    updateWishlistDto: UpdateWishlistDto,
  ): Promise<Wishlist> {
    const wishlist = await this.findOne(where);
    const items =
      updateWishlistDto.itemsId === undefined
        ? wishlist.items
        : await this.wishesService.findMany({
            where: { id: In(updateWishlistDto.itemsId) },
          });

    await this.wishlistsRepository.update(wishlist.id, {
      name: updateWishlistDto.name ?? wishlist.name,
      description: updateWishlistDto.description ?? wishlist.description,
      image: updateWishlistDto.image ?? wishlist.image,
    });

    const updatedWishlist = await this.findOne({ id: wishlist.id });
    updatedWishlist.items = items;
    await this.wishlistsRepository.save(updatedWishlist);
    return this.findOne({ id: updatedWishlist.id });
  }

  async removeOne(where: FindOptionsWhere<Wishlist>): Promise<void> {
    const wishlist = await this.findOne(where);
    await this.wishlistsRepository.remove(wishlist);
  }

  async updateOwnedWishlist(
    wishlistId: number,
    currentUser: RequestUser,
    updateWishlistDto: UpdateWishlistDto,
  ): Promise<Wishlist> {
    const wishlist = await this.findOne({ id: wishlistId });
    if (wishlist.owner.id !== currentUser.id) {
      throw new ForbiddenException('Можно редактировать только свои подборки');
    }

    return this.updateOne({ id: wishlist.id }, updateWishlistDto);
  }

  async deleteOwnedWishlist(
    wishlistId: number,
    currentUser: RequestUser,
  ): Promise<void> {
    const wishlist = await this.findOne({ id: wishlistId });
    if (wishlist.owner.id !== currentUser.id) {
      throw new ForbiddenException('Можно удалять только свои подборки');
    }

    await this.removeOne({ id: wishlist.id });
  }

  sanitizeWishlist(wishlist: Wishlist): Record<string, unknown> {
    return {
      ...wishlist,
      owner: this.usersService.toPublic(wishlist.owner, false),
      items: wishlist.items.map((wish) =>
        this.wishesService.sanitizeWish(wish, false),
      ),
    };
  }
}
