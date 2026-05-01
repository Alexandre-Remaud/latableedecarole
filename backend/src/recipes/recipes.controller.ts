import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ForbiddenException,
  Res
} from "@nestjs/common"
import type { Response } from "express"
import { ConfigService } from "@nestjs/config"
import { RecipesService } from "./recipes.service"
import { CreateRecipeDto } from "./dto/create-recipe.dto"
import { UpdateRecipeDto } from "./dto/update-recipe.dto"
import { Public } from "../auth/decorators/public.decorator"
import { CurrentUser } from "../auth/decorators/current-user.decorator"
import { Role } from "../auth/role.enum"

@Controller("recipes")
export class RecipesController {
  constructor(
    private readonly recipesService: RecipesService,
    private readonly configService: ConfigService
  ) {}

  @Public()
  @Get()
  findAll(
    @Query("category") category?: string,
    @Query("search") search?: string,
    @Query("skip") skip?: string,
    @Query("limit") limit?: string,
    @Query("tags") tagsParam?: string,
    @CurrentUser("sub") userId?: string
  ) {
    const tags = tagsParam
      ? tagsParam
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : undefined
    return this.recipesService.findAll(
      category,
      search,
      skip ? parseInt(skip, 10) : 0,
      limit ? parseInt(limit, 10) : 20,
      userId,
      tags
    )
  }

  @Public()
  @Get(":id/og")
  async getOpenGraph(@Param("id") id: string, @Res() res: Response) {
    const recipe = await this.recipesService.findOne(id)
    const frontendUrl = this.configService.get<string>("FRONTEND_URL")
    const description = recipe.description
      ? recipe.description.length > 160
        ? recipe.description.slice(0, 157) + "..."
        : recipe.description
      : ""
    const image = recipe.imageMediumUrl || recipe.imageUrl || ""
    const recipeUrl = `${frontendUrl}/recipes/${id}`
    const escHtml = (s: string) =>
      s
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<title>${escHtml(recipe.title)} — La tablée de Carole</title>
<meta property="og:title" content="${escHtml(recipe.title)}" />
<meta property="og:description" content="${escHtml(description)}" />
${image ? `<meta property="og:image" content="${escHtml(image)}" />` : ""}
<meta property="og:url" content="${escHtml(recipeUrl)}" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="La tablée de Carole" />
<meta property="og:locale" content="fr_FR" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escHtml(recipe.title)}" />
<meta name="twitter:description" content="${escHtml(description)}" />
${image ? `<meta name="twitter:image" content="${escHtml(image)}" />` : ""}
<meta http-equiv="refresh" content="0;url=${escHtml(recipeUrl)}" />
</head>
<body>
<p>Redirection vers <a href="${escHtml(recipeUrl)}">${escHtml(recipe.title)}</a>...</p>
</body>
</html>`

    res.setHeader("Content-Type", "text/html; charset=utf-8")
    res.setHeader("Cache-Control", "public, max-age=3600")
    res.send(html)
  }

  @Public()
  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUser("sub") userId?: string) {
    return this.recipesService.findOne(id, userId)
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
