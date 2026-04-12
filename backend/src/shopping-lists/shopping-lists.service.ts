import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException
} from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model, Types, isValidObjectId } from "mongoose"
import { ShoppingList, ShoppingItem } from "./entities/shopping-list.entity"
import { Recipe } from "../recipes/entities/recipe.entity"
import { CreateShoppingListDto } from "./dto/create-shopping-list.dto"
import { AddRecipeDto } from "./dto/add-recipe.dto"

@Injectable()
export class ShoppingListsService {
  constructor(
    @InjectModel(ShoppingList.name)
    private shoppingListModel: Model<ShoppingList>,
    @InjectModel(Recipe.name)
    private recipeModel: Model<Recipe>
  ) {}

  private validateObjectId(id: string): void {
    if (!isValidObjectId(id)) {
      throw new BadRequestException("Invalid ID format")
    }
  }

  private async assertOwner(userId: string, listId: string) {
    this.validateObjectId(listId)
    const list = await this.shoppingListModel.findById(listId).exec()
    if (!list) throw new NotFoundException("Liste introuvable")
    if (list.userId.toString() !== userId) throw new ForbiddenException()
    return list
  }

  private async aggregateItems(
    recipeIds: Types.ObjectId[],
    overrides: { recipeId: Types.ObjectId; servings: number }[]
  ): Promise<Omit<ShoppingItem, "_id">[]> {
    const recipes = await this.recipeModel
      .find({ _id: { $in: recipeIds } })
      .exec()

    const overrideMap = new Map(
      overrides.map((o) => [o.recipeId.toString(), o.servings])
    )

    const itemMap = new Map<
      string,
      { name: string; quantity: number | null; unit: string | null }
    >()

    for (const recipe of recipes) {
      const originalServings = recipe.servings ?? 4
      const targetServings =
        overrideMap.get(recipe._id.toString()) ?? originalServings
      const ratio = originalServings > 0 ? targetServings / originalServings : 1

      for (const ing of recipe.ingredients) {
        const normalizedName = ing.name.trim()
        const normalizedUnit = ing.unit?.trim() || null
        const key = `${normalizedName.toLowerCase()}|${normalizedUnit?.toLowerCase() ?? ""}`

        const existing = itemMap.get(key)
        const scaledQty =
          ing.quantity > 0 ? Math.round(ing.quantity * ratio * 100) / 100 : null

        if (!existing) {
          itemMap.set(key, {
            name: normalizedName,
            quantity: scaledQty,
            unit: normalizedUnit
          })
        } else if (existing.quantity !== null && scaledQty !== null) {
          existing.quantity =
            Math.round((existing.quantity + scaledQty) * 100) / 100
        }
      }
    }

    return Array.from(itemMap.values())
      .map((item) => ({
        name: item.name,
        ...(item.quantity !== null ? { quantity: item.quantity } : {}),
        ...(item.unit ? { unit: item.unit } : {}),
        checked: false
      }))
      .sort((a, b) =>
        a.name.localeCompare(b.name, "fr", { sensitivity: "base" })
      )
  }

  async create(userId: string, dto: CreateShoppingListDto) {
    const recipeObjectIds = dto.recipeIds.map((id) => {
      this.validateObjectId(id)
      return new Types.ObjectId(id)
    })

    const overrides = (dto.servingsOverrides ?? []).map((o) => ({
      recipeId: new Types.ObjectId(o.recipeId),
      servings: o.servings
    }))

    const items = await this.aggregateItems(recipeObjectIds, overrides)

    return this.shoppingListModel.create({
      userId: new Types.ObjectId(userId),
      name: dto.name,
      items,
      recipeIds: recipeObjectIds,
      servingsOverrides: overrides
    })
  }

  async findAll(userId: string) {
    const data = await this.shoppingListModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec()

    return { data, total: data.length }
  }

  async findOne(userId: string, listId: string) {
    return this.assertOwner(userId, listId)
  }

  async rename(userId: string, listId: string, name: string) {
    const list = await this.assertOwner(userId, listId)
    list.name = name
    await list.save()
    return list
  }

  async addRecipe(userId: string, listId: string, dto: AddRecipeDto) {
    this.validateObjectId(dto.recipeId)
    const list = await this.assertOwner(userId, listId)

    const newRecipeId = new Types.ObjectId(dto.recipeId)
    const alreadyPresent = list.recipeIds.some(
      (id) => id.toString() === dto.recipeId
    )
    if (!alreadyPresent) {
      list.recipeIds.push(newRecipeId)
    }

    if (dto.servings !== undefined) {
      const existingOverride = list.servingsOverrides.find(
        (o) => o.recipeId.toString() === dto.recipeId
      )
      if (existingOverride) {
        existingOverride.servings = dto.servings
      } else {
        list.servingsOverrides.push({
          recipeId: newRecipeId,
          servings: dto.servings
        })
      }
    }

    const items = await this.aggregateItems(
      list.recipeIds,
      list.servingsOverrides as { recipeId: Types.ObjectId; servings: number }[]
    )
    list.items = items as ShoppingItem[]
    await list.save()
    return list
  }

  async toggleItem(
    userId: string,
    listId: string,
    itemId: string,
    checked: boolean
  ) {
    this.validateObjectId(listId)
    this.validateObjectId(itemId)

    await this.shoppingListModel
      .updateOne(
        {
          _id: new Types.ObjectId(listId),
          userId: new Types.ObjectId(userId)
        },
        { $set: { "items.$[item].checked": checked } },
        { arrayFilters: [{ "item._id": new Types.ObjectId(itemId) }] }
      )
      .exec()

    return this.assertOwner(userId, listId)
  }

  async remove(userId: string, listId: string) {
    const list = await this.assertOwner(userId, listId)
    await list.deleteOne()
    return { message: "Liste supprimée" }
  }
}
