import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { Recipe } from "../recipes/entities/recipe.entity"

@Injectable()
export class TagsService {
  constructor(@InjectModel(Recipe.name) private recipeModel: Model<Recipe>) {}

  async findAll(limit = 20): Promise<{ name: string; count: number }[]> {
    const safeLimit = Math.min(Math.max(1, limit), 100)
    return this.recipeModel.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: safeLimit },
      { $project: { _id: 0, name: "$_id", count: 1 } }
    ])
  }

  async findPopular(): Promise<{ name: string; count: number }[]> {
    return this.findAll(20)
  }

  async remove(
    name: string
  ): Promise<{ message: string; affectedRecipes: number }> {
    const result = await this.recipeModel.updateMany(
      { tags: name },
      { $pull: { tags: name } }
    )
    return {
      message: `Tag "${name}" supprimé`,
      affectedRecipes: result.modifiedCount
    }
  }
}
