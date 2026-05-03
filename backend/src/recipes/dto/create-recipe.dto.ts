import {
  IsString,
  IsArray,
  IsOptional,
  IsNumber,
  IsEnum,
  IsNotEmpty,
  IsUrl,
  MaxLength,
  Min,
  Max,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
  MinLength
} from "class-validator"
import { Type } from "class-transformer"

class StepDto {
  @IsNumber()
  @Min(1)
  order: number

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  instruction: string

  @IsOptional()
  @IsNumber()
  @Min(0)
  duration?: number

  @IsOptional()
  @IsEnum(["min", "sec"])
  durationUnit?: "min" | "sec"

  @IsOptional()
  @IsNumber()
  @Min(0)
  temperature?: number

  @IsOptional()
  @IsEnum(["C", "F"])
  temperatureUnit?: "C" | "F"

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string
}

class IngredientDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string

  @IsNumber()
  @Min(0)
  quantity: number

  @IsString()
  @IsNotEmpty()
  unit: string
}

export class CreateRecipeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IngredientDto)
  @ArrayMinSize(1)
  ingredients: IngredientDto[]

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StepDto)
  @ArrayMinSize(1)
  steps: StepDto[]

  @IsOptional()
  @IsUrl({ require_tld: false }, { message: "L'URL de l'image est invalide" })
  imageUrl?: string

  @IsOptional()
  @IsUrl(
    { require_tld: false },
    { message: "L'URL de la miniature est invalide" }
  )
  imageThumbnailUrl?: string

  @IsOptional()
  @IsUrl(
    { require_tld: false },
    { message: "L'URL de l'image moyenne est invalide" }
  )
  imageMediumUrl?: string

  @IsOptional()
  @IsString()
  imagePublicId?: string

  @IsOptional()
  @IsNumber()
  @Min(0)
  prepTime?: number

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  servings?: number

  @IsOptional()
  @IsEnum(["easy", "medium", "hard"])
  difficulty?: "easy" | "medium" | "hard"

  @IsOptional()
  @IsEnum([
    "appetizer",
    "starter",
    "main_course",
    "side_dish",
    "dessert",
    "snack",
    "beverage",
    "sauce"
  ])
  category?:
    | "appetizer"
    | "starter"
    | "main_course"
    | "side_dish"
    | "dessert"
    | "snack"
    | "beverage"
    | "sauce"

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  @MinLength(2, { each: true })
  @MaxLength(30, { each: true })
  tags?: string[]
}
