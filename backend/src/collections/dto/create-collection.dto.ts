import {
  IsString,
  IsOptional,
  IsBoolean,
  MaxLength,
  IsNotEmpty
} from "class-validator"

export class CreateCollectionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean
}
