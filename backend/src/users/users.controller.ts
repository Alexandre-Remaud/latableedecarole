import { Controller, Get, Patch, Body, Param, Query } from "@nestjs/common"
import { UsersService } from "./users.service"
import { UpdateProfileDto } from "./dto/update-profile.dto"
import { ChangeEmailDto } from "./dto/change-email.dto"
import { ChangePasswordDto } from "./dto/change-password.dto"
import { Public } from "../auth/decorators/public.decorator"
import { CurrentUser } from "../auth/decorators/current-user.decorator"
import { FavoritesService } from "../favorites/favorites.service"

@Controller("users")
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly favoritesService: FavoritesService
  ) {}

  @Get("me/favorites")
  getMyFavorites(
    @CurrentUser("sub") userId: string,
    @Query("skip") skip?: string,
    @Query("limit") limit?: string
  ) {
    return this.favoritesService.getUserFavorites(
      userId,
      skip ? parseInt(skip, 10) : 0,
      limit ? parseInt(limit, 10) : 20
    )
  }

  @Public()
  @Get(":id/profile")
  getPublicProfile(@Param("id") id: string) {
    return this.usersService.getPublicProfile(id)
  }

  @Public()
  @Get(":id/recipes")
  getUserRecipes(
    @Param("id") id: string,
    @Query("skip") skip?: string,
    @Query("limit") limit?: string
  ) {
    return this.usersService.getUserRecipes(
      id,
      skip ? parseInt(skip, 10) : 0,
      limit ? parseInt(limit, 10) : 20
    )
  }

  @Patch("me")
  updateProfile(
    @CurrentUser("sub") userId: string,
    @Body() dto: UpdateProfileDto
  ) {
    return this.usersService.updateProfile(userId, dto)
  }

  @Patch("me/email")
  changeEmail(@CurrentUser("sub") userId: string, @Body() dto: ChangeEmailDto) {
    return this.usersService.changeEmail(userId, dto)
  }

  @Patch("me/password")
  changePassword(
    @CurrentUser("sub") userId: string,
    @Body() dto: ChangePasswordDto
  ) {
    return this.usersService.changePassword(userId, dto)
  }
}
