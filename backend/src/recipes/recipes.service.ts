import {
  Injectable,
  NotFoundException,
  BadRequestException
} from "@nestjs/common"
import { CreateRecipeDto } from "./dto/create-recipe.dto"
import { UpdateRecipeDto } from "./dto/update-recipe.dto"
import { InjectModel } from "@nestjs/mongoose"
import { Model, isValidObjectId, Types } from "mongoose"
import { Recipe } from "./entities/recipe.entity"
import { UploadService } from "../upload/upload.service"
import { FavoritesService } from "../favorites/favorites.service"
import { ReviewsService } from "../reviews/reviews.service"

const ALLOWED_UPDATE_FIELDS = [
  "title",
  "description",
  "ingredients",
  "steps",
  "imageUrl",
  "imageThumbnailUrl",
  "imageMediumUrl",
  "imagePublicId",
  "prepTime",
  "cookTime",
  "servings",
  "difficulty",
  "category",
  "tags"
]

@Injectable()
export class RecipesService {
  constructor(
    @InjectModel(Recipe.name) private recipeModel: Model<Recipe>,
    private readonly uploadService: UploadService,
    private readonly favoritesService: FavoritesService,
    private readonly reviewsService: ReviewsService
  ) {}

  private validateObjectId(id: string): void {
    if (!isValidObjectId(id)) {
      throw new BadRequestException("Invalid recipe ID format")
    }
  }

  private sanitizeUpdateDto(dto: UpdateRecipeDto): Partial<CreateRecipeDto> {
    const sanitized: Partial<CreateRecipeDto> = {}
    for (const key of ALLOWED_UPDATE_FIELDS) {
      if (key in dto) {
        ;(sanitized as Record<string, unknown>)[key] = (
          dto as Record<string, unknown>
        )[key]
      }
    }
    return sanitized
  }

  private normalizeTags(tags: string[]): string[] {
    return tags
      .map((t) => t.toLowerCase().trim())
      .filter((t) => t.length >= 2 && t.length <= 30)
      .slice(0, 10)
  }

  async create(createRecipeDto: CreateRecipeDto, userId: string) {
    const tags = createRecipeDto.tags
      ? this.normalizeTags(createRecipeDto.tags)
      : []
    return this.recipeModel.create({
      ...createRecipeDto,
      tags,
      userId: new Types.ObjectId(userId)
    })
  }

  async findAll(
    category?: string,
    search?: string,
    skip = 0,
    limit = 20,
    userId?: string,
    tags?: string[]
  ) {
    const safeSkip = Math.max(0, skip)
    const safeLimit = Math.min(Math.max(1, limit), 100)

    const filter: Record<string, unknown> = {}
    if (category) filter.category = String(category)
    if (search) {
      const escaped = String(search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      filter.title = { $regex: escaped, $options: "i" }
    }
    if (tags?.length) filter.tags = { $in: tags }
    const [data, total] = await Promise.all([
      this.recipeModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(safeSkip)
        .limit(safeLimit)
        .exec(),
      this.recipeModel.countDocuments(filter)
    ])

    const enriched = await Promise.all(
      data.map(async (recipe) => {
        const recipeId = recipe._id.toString()
        const favoritesCount =
          await this.favoritesService.getFavoritesCount(recipeId)
        const isFavorited = userId
          ? await this.favoritesService.isFavorited(userId, recipeId)
          : false
        return { ...recipe.toObject(), favoritesCount, isFavorited }
      })
    )

    return { data: enriched, total }
  }

  async findOne(id: string, userId?: string) {
    this.validateObjectId(id)
    const recipe = await this.recipeModel.findById(id).exec()
    if (!recipe) {
      throw new NotFoundException("Recipe not found")
    }

    const favoritesCount = await this.favoritesService.getFavoritesCount(id)
    const isFavorited = userId
      ? await this.favoritesService.isFavorited(userId, id)
      : false

    const recipeObj = recipe.toObject()
    return { ...recipeObj, favoritesCount, isFavorited }
  }

  async update(id: string, updateRecipeDto: UpdateRecipeDto) {
    this.validateObjectId(id)
    const sanitized = this.sanitizeUpdateDto(updateRecipeDto)
    if (sanitized.tags !== undefined) {
      sanitized.tags = this.normalizeTags(sanitized.tags)
    }
    const recipe = await this.recipeModel.findById(id).exec()
    if (!recipe) {
      throw new NotFoundException("Recipe not found")
    }
    Object.assign(recipe, sanitized)
    await recipe.save()
    return recipe
  }

  async remove(id: string) {
    this.validateObjectId(id)
    const recipe = await this.recipeModel.findByIdAndDelete(id).exec()
    if (!recipe) {
      throw new NotFoundException("Recipe not found")
    }
    if (recipe.imagePublicId) {
      await this.uploadService.deleteByPublicId(recipe.imagePublicId)
    }
    await this.favoritesService.deleteByRecipeId(id)
    await this.reviewsService.deleteByRecipeId(id)
    return recipe
  }
}
