import {
  Injectable,
  NotFoundException,
  BadRequestException
} from "@nestjs/common"
import { CreateRecipeDto } from "./dto/create-recipe.dto"
import { UpdateRecipeDto } from "./dto/update-recipe.dto"
import { InjectModel } from "@nestjs/mongoose"
import { Model, isValidObjectId } from "mongoose"
import { Recipe } from "./entities/recipe.entity"

@Injectable()
export class RecipesService {
  constructor(@InjectModel(Recipe.name) private recipeModel: Model<Recipe>) {}

  private validateObjectId(id: string): void {
    if (!isValidObjectId(id)) {
      throw new BadRequestException("Invalid recipe ID format")
    }
  }

  async create(createRecipeDto: CreateRecipeDto) {
    return this.recipeModel.create(createRecipeDto)
  }

  async findAll(category?: string, search?: string, skip = 0, limit = 20) {
    const filter: Record<string, unknown> = {}
    if (category) filter.category = category
    if (search) filter.title = { $regex: search, $options: "i" }
    const [data, total] = await Promise.all([
      this.recipeModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.recipeModel.countDocuments(filter)
    ])
    return { data, total }
  }

  async findOne(id: string) {
    this.validateObjectId(id)
    const recipe = await this.recipeModel.findById(id).exec()
    if (!recipe) {
      throw new NotFoundException("Recipe not found")
    }
    return recipe
  }

  async update(id: string, updateRecipeDto: UpdateRecipeDto) {
    this.validateObjectId(id)
    const recipe = await this.recipeModel
      .findByIdAndUpdate(id, updateRecipeDto, { new: true })
      .exec()
    if (!recipe) {
      throw new NotFoundException("Recipe not found")
    }
    return recipe
  }

  async remove(id: string) {
    this.validateObjectId(id)
    const recipe = await this.recipeModel.findByIdAndDelete(id).exec()
    if (!recipe) {
      throw new NotFoundException("Recipe not found")
    }
    return recipe
  }
}
