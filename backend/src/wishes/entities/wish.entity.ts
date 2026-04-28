import {
  IsInt,
  IsNumber,
  IsString,
  IsUrl,
  Length,
  MaxLength,
  Min,
} from 'class-validator';
import { Column, Entity, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Offer } from '../../offers/entities/offer.entity';
import { User } from '../../users/entities/user.entity';
import { Wishlist } from '../../wishlists/entities/wishlist.entity';

@Entity({ name: 'wishes' })
export class Wish extends BaseEntity {
  @Column({ type: 'varchar', length: 250 })
  @IsString()
  @Length(1, 250)
  name!: string;

  @Column({ type: 'varchar' })
  @IsUrl()
  link!: string;

  @Column({ type: 'varchar' })
  @IsUrl()
  image!: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  price!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  raised!: number;

  @ManyToOne(() => User, (user) => user.wishes, { eager: true })
  owner!: User;

  @Column({ type: 'varchar', length: 1024 })
  @IsString()
  @MaxLength(1024)
  @Length(1, 1024)
  description!: string;

  @OneToMany(() => Offer, (offer) => offer.item)
  offers!: Offer[];

  @Column({ type: 'int', default: 0 })
  @IsInt()
  @Min(0)
  copied!: number;

  @ManyToMany(() => Wishlist, (wishlist) => wishlist.items)
  wishlists!: Wishlist[];
}
