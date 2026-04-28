import { IsString, IsUrl, Length, MaxLength } from 'class-validator';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Wish } from '../../wishes/entities/wish.entity';

@Entity({ name: 'wishlists' })
export class Wishlist extends BaseEntity {
  @Column({ type: 'varchar', length: 250 })
  @IsString()
  @Length(1, 250)
  name!: string;

  @Column({ type: 'varchar', length: 1500 })
  @IsString()
  @MaxLength(1500)
  @Length(1, 1500)
  description!: string;

  @Column({ type: 'varchar' })
  @IsUrl()
  image!: string;

  @ManyToOne(() => User, (user) => user.wishlists, { eager: true })
  owner!: User;

  @ManyToMany(() => Wish, (wish) => wish.wishlists, { eager: true })
  @JoinTable()
  items!: Wish[];
}
