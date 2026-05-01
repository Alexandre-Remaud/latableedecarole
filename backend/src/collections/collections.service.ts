import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException
} from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model, Types, isValidObjectId } from "mongoose"
import { Collection } from "./entities/collection.entity"
import { Recipe } from "../recipes/entities/recipe.entity"
import { CreateCollectionDto } from "./dto/create-collection.dto"
import { UpdateCollectionDto } from "./dto/update-collection.dto"

@Injectable()
export class CollectionsService {
  constructor(
    @InjectModel(Collection.name) private collectionModel: Model<Collection>,
    @InjectModel(Recipe.name) private recipeModel: Model<Recipe>
  ) {}

  private validateObjectId(id: string): void {
    if (!isValidObjectId(id)) {
      throw new BadRequestException("Invalid ID format")
    }
  }

  async create(userId: string, dto: CreateCollectionDto) {
    return this.collectionModel.create({
      userId: new Types.ObjectId(userId),
      name: dto.name,
      description: dto.description,
      isPublic: dto.isPublic ?? false
    })
  }

  async findMine(userId: string, skip = 0, limit = 20) {
    const safeSkip = Math.max(0, skip)
    const safeLimit = Math.min(Math.max(1, limit), 100)
    const filter = { userId: new Types.ObjectId(userId) }
    const [data, total] = await Promise.all([
      this.collectionModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(safeSkip)
        .limit(safeLimit)
        .exec(),
      this.collectionModel.countDocuments(filter)
    ])
    return { data, total }
  }

  async findOne(collectionId: string, requestUserId: string | undefined) {
    this.validateObjectId(collectionId)
    const safeId = new Types.ObjectId(collectionId)
    const collection = await this.collectionModel.findById(safeId).exec()
    if (!collection) throw new NotFoundException("Collection not found")

    const isOwner =
      requestUserId && collection.userId.toString() === requestUserId
    if (!collection.isPublic && !isOwner) {
      throw new ForbiddenException("Collection is private")
    }

    const recipes = await this.recipeModel
      .find({ _id: { $in: collection.recipeIds } })
      .exec()

    const recipeMap = new Map(recipes.map((r) => [r._id.toString(), r]))
    const orderedRecipes = collection.recipeIds
      .map((id) => recipeMap.get(id.toString()))
      .filter(Boolean)

    return { ...collection.toObject(), recipes: orderedRecipes }
  }

  async update(collectionId: string, userId: string, dto: UpdateCollectionDto) {
    this.validateObjectId(collectionId)
    const safeId = new Types.ObjectId(collectionId)
    const collection = await this.collectionModel.findById(safeId).exec()
    if (!collection) throw new NotFoundException("Collection not found")
    if (collection.userId.toString() !== userId) {
      throw new ForbiddenException("Not the owner")
    }

    if (dto.name !== undefined) collection.name = dto.name
    if (dto.description !== undefined) collection.description = dto.description
    if (dto.isPublic !== undefined) collection.isPublic = dto.isPublic
    if (dto.coverImage !== undefined) collection.coverImage = dto.coverImage

    await collection.save()
    return collection
  }

  async remove(collectionId: string, userId: string) {
    this.validateObjectId(collectionId)
    const safeId = new Types.ObjectId(collectionId)
    const collection = await this.collectionModel.findById(safeId).exec()
    if (!collection) throw new NotFoundException("Collection not found")
    if (collection.userId.toString() !== userId) {
      throw new ForbiddenException("Not the owner")
    }
    await this.collectionModel.findByIdAndDelete(safeId).exec()
    return { deleted: true }
  }

  async addRecipe(collectionId: string, userId: string, recipeId: string) {
    this.validateObjectId(collectionId)
    this.validateObjectId(recipeId)
    const safeCollectionId = new Types.ObjectId(collectionId)
    const safeRecipeId = new Types.ObjectId(recipeId)

    const collection = await this.collectionModel
      .findById(safeCollectionId)
      .exec()
    if (!collection) throw new NotFoundException("Collection not found")
    if (collection.userId.toString() !== userId) {
      throw new ForbiddenException("Not the owner")
    }

    const recipe = await this.recipeModel.findById(safeRecipeId).exec()
    if (!recipe) throw new NotFoundException("Recipe not found")

    const alreadyIn = collection.recipeIds.some(
      (id) => id.toString() === safeRecipeId.toString()
    )
    if (alreadyIn) throw new ConflictException("Recipe already in collection")

    collection.recipeIds.push(safeRecipeId)
    await collection.save()

    const recipes = await this.recipeModel
      .find({ _id: { $in: collection.recipeIds } })
      .exec()
    const recipeMap = new Map(recipes.map((r) => [r._id.toString(), r]))
    const orderedRecipes = collection.recipeIds
      .map((id) => recipeMap.get(id.toString()))
      .filter(Boolean)

    return { ...collection.toObject(), recipes: orderedRecipes }
  }

  async removeRecipe(collectionId: string, userId: string, recipeId: string) {
    this.validateObjectId(collectionId)
    this.validateObjectId(recipeId)
    const safeCollectionId = new Types.ObjectId(collectionId)

    const collection = await this.collectionModel
      .findById(safeCollectionId)
      .exec()
    if (!collection) throw new NotFoundException("Collection not found")
    if (collection.userId.toString() !== userId) {
      throw new ForbiddenException("Not the owner")
    }

    collection.recipeIds = collection.recipeIds.filter(
      (id) => id.toString() !== recipeId
    )
    await collection.save()

    const recipes = await this.recipeModel
      .find({ _id: { $in: collection.recipeIds } })
      .exec()
    const recipeMap = new Map(recipes.map((r) => [r._id.toString(), r]))
    const orderedRecipes = collection.recipeIds
      .map((id) => recipeMap.get(id.toString()))
      .filter(Boolean)

    return { ...collection.toObject(), recipes: orderedRecipes }
  }
}
