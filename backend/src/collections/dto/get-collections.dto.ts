import { IsOptional, IsNumberString } from "class-validator"

export class GetCollectionsDto {
  @IsOptional()
  @IsNumberString()
  skip?: string

  @IsOptional()
  @IsNumberString()
  limit?: string
}
