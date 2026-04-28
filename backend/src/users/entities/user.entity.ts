import { Exclude } from 'class-transformer';
import {
  IsEmail,
  IsString,
  IsUrl,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Column, Entity, OneToMany, Unique } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Offer } from '../../offers/entities/offer.entity';
import { Wish } from '../../wishes/entities/wish.entity';
import { Wishlist } from '../../wishlists/entities/wishlist.entity';

@Entity({ name: 'users' })
@Unique(['username'])
@Unique(['email'])
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 30 })
  @IsString()
  @Length(2, 30)
  username!: string;

  @Column({
    type: 'varchar',
    length: 200,
    default: 'Пока ничего не рассказал о себе',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  about!: string;

  @Column({ type: 'varchar', default: 'https://i.pravatar.cc/300' })
  @IsUrl()
  avatar!: string;

  @Column({ type: 'varchar' })
  @IsEmail()
  email!: string;

  @Column({ type: 'varchar', select: false })
  @Exclude()
  password!: string;

  @OneToMany(() => Wish, (wish) => wish.owner)
  wishes!: Wish[];

  @OneToMany(() => Offer, (offer) => offer.user)
  offers!: Offer[];

  @OneToMany(() => Wishlist, (wishlist) => wishlist.owner)
  wishlists!: Wishlist[];
}
