import { IsOptional, IsNumberString } from "class-validator"

export class GetFavoritesDto {
  @IsOptional()
  @IsNumberString()
  skip?: string

  @IsOptional()
  @IsNumberString()
  limit?: string
}
