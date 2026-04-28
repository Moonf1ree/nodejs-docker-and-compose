import {
  IsNumber,
  IsString,
  IsUrl,
  Length,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateWishDto {
  @IsString()
  @Length(1, 250)
  name!: string;

  @IsUrl()
  link!: string;

  @IsUrl()
  image!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  price!: number;

  @IsString()
  @MaxLength(1024)
  @Length(1, 1024)
  description!: string;
}
