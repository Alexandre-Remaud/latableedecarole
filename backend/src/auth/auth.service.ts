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
import { RegisterDto } from "./dto/register.dto"
import { LoginDto } from "./dto/login.dto"
import { Role } from "./role.enum"

export interface JwtPayload {
  sub: string
  email: string
  role: Role
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userModel.findOne({
      email: registerDto.email
    })
    if (existingUser) {
      throw new ConflictException("Email already registered")
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10)
    const user = await this.userModel.create({
      email: registerDto.email,
      name: registerDto.name,
      password: hashedPassword
    })

    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role
    }

    return {
      user: this.sanitizeUser(user),
      accessToken: this.jwtService.sign(payload)
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.userModel.findOne({ email: loginDto.email })
    if (!user) {
      throw new UnauthorizedException("Invalid credentials")
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password
    )
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials")
    }

    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role
    }

    return {
      user: this.sanitizeUser(user),
      accessToken: this.jwtService.sign(payload)
    }
  }

  async validateUser(payload: JwtPayload): Promise<UserDocument | null> {
    return this.userModel.findById(payload.sub)
  }

  private sanitizeUser(user: UserDocument) {
    const obj = user.toObject() as unknown as Record<string, unknown>
    delete obj.password
    return obj
  }
}
