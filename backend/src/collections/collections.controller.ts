import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus
} from "@nestjs/common"
import { CollectionsService } from "./collections.service"
import { CreateCollectionDto } from "./dto/create-collection.dto"
import { UpdateCollectionDto } from "./dto/update-collection.dto"
import { GetCollectionsDto } from "./dto/get-collections.dto"
import { CurrentUser } from "../auth/decorators/current-user.decorator"
import { Public } from "../auth/decorators/public.decorator"

@Controller("collections")
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Post()
  create(@CurrentUser("sub") userId: string, @Body() dto: CreateCollectionDto) {
    return this.collectionsService.create(userId, dto)
  }

  @Get("me")
  findMine(
    @CurrentUser("sub") userId: string,
    @Query() query: GetCollectionsDto
  ) {
    const skip = query.skip ? parseInt(query.skip, 10) : 0
    const limit = query.limit ? parseInt(query.limit, 10) : 20
    return this.collectionsService.findMine(userId, skip, limit)
  }

  @Public()
  @Get(":id")
  findOne(
    @Param("id") collectionId: string,
    @CurrentUser("sub") userId: string | undefined
  ) {
    return this.collectionsService.findOne(collectionId, userId)
  }

  @Patch(":id")
  update(
    @Param("id") collectionId: string,
    @CurrentUser("sub") userId: string,
    @Body() dto: UpdateCollectionDto
  ) {
    return this.collectionsService.update(collectionId, userId, dto)
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  remove(
    @Param("id") collectionId: string,
    @CurrentUser("sub") userId: string
  ) {
    return this.collectionsService.remove(collectionId, userId)
  }

  @Post(":id/recipes")
  addRecipe(
    @Param("id") collectionId: string,
    @CurrentUser("sub") userId: string,
    @Body() body: { recipeId: string }
  ) {
    return this.collectionsService.addRecipe(
      collectionId,
      userId,
      body.recipeId
    )
  }

  @Delete(":id/recipes/:recipeId")
  @HttpCode(HttpStatus.OK)
  removeRecipe(
    @Param("id") collectionId: string,
    @CurrentUser("sub") userId: string,
    @Param("recipeId") recipeId: string
  ) {
    return this.collectionsService.removeRecipe(collectionId, userId, recipeId)
  }
}
