import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/types/request-user.interface';
import { CreateOfferDto } from './dto/create-offer.dto';
import { OffersService } from './offers.service';

@UseGuards(JwtAuthGuard)
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  async createOffer(
    @Body() createOfferDto: CreateOfferDto,
    @CurrentUser() currentUser: RequestUser,
  ) {
    const offer = await this.offersService.create(createOfferDto, currentUser);
    return this.offersService.sanitizeOffer(offer, currentUser);
  }

  @Get()
  async getOffers(@CurrentUser() currentUser: RequestUser) {
    const offers = await this.offersService.findMany();
    return offers.map((offer) =>
      this.offersService.sanitizeOffer(offer, currentUser),
    );
  }
}
