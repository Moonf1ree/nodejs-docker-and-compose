import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsString,
  IsUrl,
  Length,
  MaxLength,
} from 'class-validator';

export class CreateWishlistDto {
  @IsString()
  @Length(1, 250)
  name!: string;

  @IsString()
  @MaxLength(1500)
  @Length(1, 1500)
  description!: string;

  @IsUrl()
  image!: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  itemsId!: number[];
}
