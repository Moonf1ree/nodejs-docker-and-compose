import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOptionsWhere, Repository } from 'typeorm';
import { RequestUser } from '../common/types/request-user.interface';
import { UsersService } from '../users/users.service';
import { WishesService } from '../wishes/wishes.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { Offer } from './entities/offer.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offersRepository: Repository<Offer>,
    private readonly wishesService: WishesService,
    private readonly usersService: UsersService,
  ) {}

  async create(
    createOfferDto: CreateOfferDto,
    currentUser: RequestUser,
  ): Promise<Offer> {
    const user = await this.usersService.findOne({ id: currentUser.id });
    const wish = await this.wishesService.findOne({
      id: createOfferDto.itemId,
    });

    if (wish.owner.id === currentUser.id) {
      throw new ForbiddenException('Нельзя скидываться на собственный подарок');
    }

    const currentRaised = Number(wish.raised);
    const wishPrice = Number(wish.price);
    const amount = Number(createOfferDto.amount);

    if (currentRaised >= wishPrice) {
      throw new BadRequestException('На этот подарок уже собрана полная сумма');
    }

    if (currentRaised + amount > wishPrice) {
      throw new BadRequestException(
        'Сумма заявки превышает оставшуюся стоимость подарка',
      );
    }

    const offer = this.offersRepository.create({
      amount,
      hidden: createOfferDto.hidden ?? false,
      user,
      item: wish,
    });

    wish.raised = Number((currentRaised + amount).toFixed(2));
    await this.offersRepository.save(offer);
    await this.wishesService.setRaisedAmount(wish.id, wish.raised);

    return this.findOne({ id: offer.id });
  }

  async findOne(where: FindOptionsWhere<Offer>): Promise<Offer> {
    const offer = await this.offersRepository.findOne({ where });
    if (!offer) {
      throw new NotFoundException('Заявка не найдена');
    }

    return offer;
  }

  findMany(options?: FindManyOptions<Offer>): Promise<Offer[]> {
    return this.offersRepository.find(options);
  }

  async removeOne(where: FindOptionsWhere<Offer>): Promise<void> {
    const offer = await this.findOne(where);
    await this.offersRepository.remove(offer);
  }

  sanitizeOffer(
    offer: Offer,
    currentUser: RequestUser,
  ): Record<string, unknown> {
    const canSeeUser =
      !offer.hidden ||
      offer.user.id === currentUser.id ||
      offer.item.owner.id === currentUser.id;

    return {
      ...offer,
      amount: Number(offer.amount),
      user: canSeeUser
        ? this.usersService.toPublic(offer.user, false)
        : { id: offer.user.id, username: 'Скрыто' },
      item: this.wishesService.sanitizeWish(offer.item, false),
    };
  }
}
