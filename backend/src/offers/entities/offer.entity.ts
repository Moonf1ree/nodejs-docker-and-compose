import { IsBoolean, IsNumber, Min } from 'class-validator';
import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Wish } from '../../wishes/entities/wish.entity';

@Entity({ name: 'offers' })
export class Offer extends BaseEntity {
  @ManyToOne(() => User, (user) => user.offers, { eager: true })
  user!: User;

  @ManyToOne(() => Wish, (wish) => wish.offers, { eager: true })
  item!: Wish;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  amount!: number;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  hidden!: boolean;
}
