import { IsOptional, IsNumberString } from "class-validator"

export class GetReviewsDto {
  @IsOptional()
  @IsNumberString()
  skip?: string

  @IsOptional()
  @IsNumberString()
  limit?: string
}
