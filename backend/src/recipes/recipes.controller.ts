import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ForbiddenException
} from "@nestjs/common"
import { RecipesService } from "./recipes.service"
import { CreateRecipeDto } from "./dto/create-recipe.dto"
import { UpdateRecipeDto } from "./dto/update-recipe.dto"
import { Public } from "../auth/decorators/public.decorator"
import { CurrentUser } from "../auth/decorators/current-user.decorator"
import { Role } from "../auth/role.enum"

@Controller("recipes")
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Public()
  @Get()
  findAll(
    @Query("category") category?: string,
    @Query("search") search?: string,
    @Query("skip") skip?: string,
    @Query("limit") limit?: string
  ) {
    return this.recipesService.findAll(
      category,
      search,
      skip ? parseInt(skip, 10) : 0,
      limit ? parseInt(limit, 10) : 20
    )
  }

  @Public()
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.recipesService.findOne(id)
  }

  @Post()
  create(
    @Body() createRecipeDto: CreateRecipeDto,
    @CurrentUser("sub") userId: string
  ) {
    return this.recipesService.create(createRecipeDto, userId)
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateRecipeDto: UpdateRecipeDto,
    @CurrentUser("sub") userId: string,
    @CurrentUser("role") role: Role
  ) {
    const recipe = await this.recipesService.findOne(id)
    if (recipe.userId.toString() !== userId && role !== Role.ADMIN) {
      throw new ForbiddenException("You can only update your own recipes")
    }
    return this.recipesService.update(id, updateRecipeDto)
  }

  @Delete(":id")
  async remove(
    @Param("id") id: string,
    @CurrentUser("sub") userId: string,
    @CurrentUser("role") role: Role
  ) {
    const recipe = await this.recipesService.findOne(id)
    if (recipe.userId.toString() !== userId && role !== Role.ADMIN) {
      throw new ForbiddenException("You can only delete your own recipes")
    }
    return this.recipesService.remove(id)
  }
}
