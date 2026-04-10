import { IsString, IsOptional, MaxLength, IsUrl } from "class-validator"

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100, {
    message: "Le nom ne doit pas dépasser 100 caractères"
  })
  name?: string

  @IsOptional()
  @IsString()
  @MaxLength(500, {
    message: "La bio ne doit pas dépasser 500 caractères"
  })
  bio?: string

  @IsOptional()
  @IsUrl({ require_tld: false }, { message: "L'URL de l'avatar est invalide" })
  avatarUrl?: string
}
