import {
  Injectable,
  UnauthorizedException,
  ConflictException
} from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import * as bcrypt from "bcrypt"
import * as crypto from "crypto"
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

  private generateRefreshToken(): string {
    return crypto.randomBytes(64).toString("hex")
  }

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
    await this.refreshTokenModel.create({
      userId,
      token,
      expiresAt
    })
  }

  private async invalidateRefreshTokens(userId: string): Promise<void> {
    await this.refreshTokenModel.deleteMany({ userId })
  }

  private async verifyRefreshToken(
    token: string
  ): Promise<RefreshTokenDocument | null> {
    const storedToken = await this.refreshTokenModel
      .findOne({ token })
      .populate("userId")
      .lean()

    if (!storedToken || storedToken.expiresAt < new Date()) {
      return null
    }

    return storedToken as unknown as RefreshTokenDocument
  }

  private sanitizeUser(user: UserDocument): Record<string, unknown> {
    const obj = user.toObject() as unknown as Record<string, unknown>
    delete obj.password
    delete obj.__v
    return obj
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
    user: Record<string, unknown>
    accessToken: string
    refreshToken: string
  }> {
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
    try {
      this.jwtService.verify<{ sub: string }>(refreshToken)
    } catch {
      throw new UnauthorizedException("Refresh token invalide ou expiré")
    }

    const storedToken = await this.verifyRefreshToken(refreshToken)
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
