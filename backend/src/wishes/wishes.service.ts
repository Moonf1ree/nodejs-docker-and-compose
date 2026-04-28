import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeepPartial,
  FindManyOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { RequestUser } from '../common/types/request-user.interface';
import { UsersService } from '../users/users.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { Wish } from './entities/wish.entity';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private readonly wishesRepository: Repository<Wish>,
    private readonly usersService: UsersService,
  ) {}

  async create(
    createWishDto: CreateWishDto,
    currentUser: RequestUser,
  ): Promise<Wish> {
    const owner = await this.usersService.findOne({ id: currentUser.id });
    const wish = this.wishesRepository.create({
      ...createWishDto,
      owner,
      raised: 0,
      copied: 0,
    });

    return this.wishesRepository.save(wish);
  }

  async findOne(where: FindOptionsWhere<Wish>): Promise<Wish> {
    const wish = await this.wishesRepository.findOne({
      where,
      relations: {
        offers: {
          user: true,
        },
      },
    });

    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }

    return wish;
  }

  findMany(options?: FindManyOptions<Wish>): Promise<Wish[]> {
    return this.wishesRepository.find(options);
  }

  async updateOne(
    where: FindOptionsWhere<Wish>,
    updateWishDto: UpdateWishDto,
  ): Promise<Wish> {
    const wish = await this.findOne(where);
    const patch: DeepPartial<Wish> = {
      ...updateWishDto,
    };

    delete patch.raised;
    delete patch.copied;
    delete patch.owner;
    delete patch.offers;

    await this.wishesRepository.update(wish.id, patch);
    return this.findOne({ id: wish.id });
  }

  async setRaisedAmount(wishId: number, raised: number): Promise<Wish> {
    const wish = await this.findOne({ id: wishId });
    wish.raised = Number(raised.toFixed(2));
    await this.wishesRepository.save(wish);
    return this.findOne({ id: wish.id });
  }

  async removeOne(where: FindOptionsWhere<Wish>): Promise<void> {
    const wish = await this.findOne(where);
    await this.wishesRepository.remove(wish);
  }

  async updateOwnedWish(
    wishId: number,
    currentUser: RequestUser,
    updateWishDto: UpdateWishDto,
  ): Promise<Wish> {
    const wish = await this.findOne({ id: wishId });
    if (wish.owner.id !== currentUser.id) {
      throw new ForbiddenException('Можно редактировать только свои подарки');
    }

    if (wish.offers.length > 0 && updateWishDto.price !== undefined) {
      throw new BadRequestException(
        'Нельзя менять стоимость подарка, если есть желающие скинуться',
      );
    }

    return this.updateOne({ id: wish.id }, updateWishDto);
  }

  async deleteOwnedWish(
    wishId: number,
    currentUser: RequestUser,
  ): Promise<void> {
    const wish = await this.findOne({ id: wishId });
    if (wish.owner.id !== currentUser.id) {
      throw new ForbiddenException('Можно удалять только свои подарки');
    }

    await this.removeOne({ id: wish.id });
  }

  async copyWish(wishId: number, currentUser: RequestUser): Promise<Wish> {
    const sourceWish = await this.findOne({ id: wishId });
    const owner = await this.usersService.findOne({ id: currentUser.id });

    if (sourceWish.owner.id === currentUser.id) {
      throw new BadRequestException('Нельзя копировать собственный подарок');
    }

    sourceWish.copied += 1;
    await this.wishesRepository.save(sourceWish);

    const copiedWish = this.wishesRepository.create({
      name: sourceWish.name,
      link: sourceWish.link,
      image: sourceWish.image,
      price: Number(sourceWish.price),
      description: sourceWish.description,
      raised: 0,
      copied: 0,
      owner,
    });

    return this.wishesRepository.save(copiedWish);
  }

  sanitizeWish(wish: Wish, includeOffers = true): Record<string, unknown> {
    const sanitized = {
      ...wish,
      owner: this.usersService.toPublic(wish.owner, false),
      price: Number(wish.price),
      raised: Number(wish.raised),
    } as Record<string, unknown>;

    if (includeOffers && wish.offers) {
      sanitized.offers = wish.offers.map((offer) => ({
        ...offer,
        amount: Number(offer.amount),
        user: offer.hidden
          ? { id: offer.user.id, username: 'Скрыто' }
          : this.usersService.toPublic(offer.user, false),
      }));
    }

    return sanitized;
  }
}
