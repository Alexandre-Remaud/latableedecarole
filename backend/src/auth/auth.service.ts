import {
  Injectable,
  UnauthorizedException,
  ConflictException
} from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import * as bcrypt from "bcrypt"
import { User, UserDocument } from "../users/entities/user.entity"
import {
  RefreshToken,
  RefreshTokenDocument
} from "./entities/refresh-token.entity"
import { RegisterDto } from "./dto/register.dto"
import { LoginDto } from "./dto/login.dto"
import { Role } from "./role.enum"

export interface JwtPayload {
  sub: string
  email: string
  role: Role
}

export type SafeUser = Omit<
  ReturnType<UserDocument["toObject"]>,
  "password" | "__v"
>

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

@Injectable()
export class AuthService {
  private readonly ACCESS_TOKEN_TTL = "15m"
  private readonly REFRESH_TOKEN_TTL_DAYS = 7

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshTokenDocument>,
    private jwtService: JwtService
  ) {}

  private getRefreshTokenExpiry(): Date {
    const date = new Date()
    date.setDate(date.getDate() + this.REFRESH_TOKEN_TTL_DAYS)
    return date
  }

  private createAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, { expiresIn: this.ACCESS_TOKEN_TTL })
  }

  private createRefreshToken(userId: string): string {
    const payload = { sub: userId, type: "refresh" }
    return this.jwtService.sign(payload, {
      expiresIn: `${this.REFRESH_TOKEN_TTL_DAYS}d`
    })
  }

  private async saveRefreshToken(
    userId: string,
    token: string,
    expiresAt: Date
  ): Promise<void> {
    const hashedToken = await bcrypt.hash(token, 10)
    await this.refreshTokenModel.create({
      userId,
      token: hashedToken,
      expiresAt
    })
  }

  private async invalidateRefreshTokens(userId: string): Promise<void> {
    await this.refreshTokenModel.deleteMany({ userId })
  }

  private async verifyRefreshToken(
    token: string,
    userId: string
  ): Promise<RefreshTokenDocument | null> {
    const storedTokens = await this.refreshTokenModel.find({ userId })

    for (const storedToken of storedTokens) {
      if (storedToken.expiresAt < new Date()) continue
      const isMatch = await bcrypt.compare(token, storedToken.token)
      if (isMatch) return storedToken
    }

    return null
  }

  private sanitizeUser(user: UserDocument): SafeUser {
    const { password: _password, __v: _v, ...rest } = user.toObject()
    return rest
  }

  private buildPayload(user: UserDocument): JwtPayload {
    return {
      sub: user._id.toString(),
      email: user.email,
      role: user.role
    }
  }

  async register(registerDto: RegisterDto) {
    const email = String(registerDto.email).toLowerCase().trim()
    const existingUser = await this.userModel.exists({ email }).lean()
    if (existingUser) {
      throw new ConflictException("Cet email est déjà utilisé")
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10)
    const user = await this.userModel.create({
      email,
      name: registerDto.name.trim(),
      password: hashedPassword
    })

    return this.generateAuthResponse(user)
  }

  async login(loginDto: LoginDto) {
    const email = String(loginDto.email).toLowerCase().trim()
    const user = await this.userModel.findOne({ email })
    if (!user) {
      throw new UnauthorizedException("Identifiants invalides")
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password
    )
    if (!isPasswordValid) {
      throw new UnauthorizedException("Identifiants invalides")
    }

    return this.generateAuthResponse(user)
  }

  private async generateAuthResponse(user: UserDocument): Promise<{
    user: SafeUser
    accessToken: string
    refreshToken: string
  }> {
    await this.invalidateRefreshTokens(user._id.toString())

    const payload = this.buildPayload(user)
    const accessToken = this.createAccessToken(payload)
    const refreshToken = this.createRefreshToken(user._id.toString())

    await this.saveRefreshToken(
      user._id.toString(),
      refreshToken,
      this.getRefreshTokenExpiry()
    )

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken
    }
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    let decoded: { sub: string; type?: string }
    try {
      decoded = this.jwtService.verify<{ sub: string; type?: string }>(
        refreshToken
      )
    } catch {
      throw new UnauthorizedException("Refresh token invalide ou expiré")
    }

    if (decoded.type !== "refresh") {
      throw new UnauthorizedException("Token invalide")
    }

    const storedToken = await this.verifyRefreshToken(refreshToken, decoded.sub)
    if (!storedToken) {
      throw new UnauthorizedException("Refresh token invalide ou expiré")
    }

    const user = await this.userModel.findById(storedToken.userId)
    if (!user) {
      throw new UnauthorizedException("Utilisateur non trouvé")
    }

    await this.refreshTokenModel.deleteOne({ _id: storedToken._id })

    const payload = this.buildPayload(user)
    const newAccessToken = this.createAccessToken(payload)
    const newRefreshToken = this.createRefreshToken(user._id.toString())

    await this.saveRefreshToken(
      user._id.toString(),
      newRefreshToken,
      this.getRefreshTokenExpiry()
    )

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    }
  }

  async logout(userId: string): Promise<void> {
    await this.invalidateRefreshTokens(userId)
  }

  async validateUser(payload: JwtPayload): Promise<UserDocument | null> {
    return this.userModel.findById(payload.sub)
  }
}
