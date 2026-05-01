import { Controller, Get, Delete, Param, Query } from "@nestjs/common"
import { TagsService } from "./tags.service"
import { Public } from "../auth/decorators/public.decorator"
import { Roles } from "../auth/decorators/roles.decorator"
import { Role } from "../auth/role.enum"

@Controller("tags")
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Public()
  @Get()
  findAll(@Query("limit") limit?: string) {
    return this.tagsService.findAll(limit ? parseInt(limit, 10) : 20)
  }

  @Public()
  @Get("popular")
  findPopular() {
    return this.tagsService.findPopular()
  }

  @Roles(Role.ADMIN)
  @Delete(":name")
  remove(@Param("name") name: string) {
    return this.tagsService.remove(name)
  }
}
