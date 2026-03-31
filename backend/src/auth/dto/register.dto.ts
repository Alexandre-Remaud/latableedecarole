import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional
} from "class-validator"

export class RegisterDto {
  @IsEmail()
  email: string

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string

  @IsString()
  @IsNotEmpty()
  name: string

  @IsOptional()
  role?: never
}
