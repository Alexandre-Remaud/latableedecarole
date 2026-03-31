import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  Get
} from "@nestjs/common"
import type { Response } from "express"
import { AuthService } from "./auth.service"
import { RegisterDto } from "./dto/register.dto"
import { LoginDto } from "./dto/login.dto"
import { Public } from "./decorators/public.decorator"
import { CurrentUser } from "./decorators/current-user.decorator"
import { setAuthCookies, clearAuthCookies } from "../main"
import type { JwtPayload } from "./auth.service"

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("register")
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.authService.register(registerDto)
    setAuthCookies(res, result.accessToken)
    return { user: result.user }
  }

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.authService.login(loginDto)
    setAuthCookies(res, result.accessToken)
    return { user: result.user }
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    clearAuthCookies(res)
    return { message: "Logged out successfully" }
  }

  @Get("me")
  getProfile(@CurrentUser() user: JwtPayload) {
    return { id: user.sub, email: user.email, role: user.role }
  }
}
