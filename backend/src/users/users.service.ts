import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  ConflictException
} from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model, Types, isValidObjectId } from "mongoose"
import * as bcrypt from "bcrypt"
import { User, UserDocument } from "./entities/user.entity"
import { Recipe } from "../recipes/entities/recipe.entity"
import { UpdateProfileDto } from "./dto/update-profile.dto"
import { ChangeEmailDto } from "./dto/change-email.dto"
import { ChangePasswordDto } from "./dto/change-password.dto"

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Recipe.name) private recipeModel: Model<Recipe>
  ) {}

  private validateObjectId(id: string): void {
    if (!isValidObjectId(id)) {
      throw new BadRequestException("Format d'identifiant invalide")
    }
  }

  async getPublicProfile(id: string) {
    this.validateObjectId(id)

    const user = await this.userModel
      .findById(id)
      .select("-password -__v")
      .lean()
      .exec()

    if (!user) {
      throw new NotFoundException("Utilisateur non trouvé")
    }

    const recipesCount = await this.recipeModel.countDocuments({
      userId: new Types.ObjectId(id)
    })

    return {
      id: user._id,
      name: user.name,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      createdAt: user.createdAt,
      recipesCount
    }
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const update: Record<string, unknown> = {}
    if (dto.name !== undefined) update.name = dto.name.trim()
    if (dto.bio !== undefined) update.bio = dto.bio.trim()
    if (dto.avatarUrl !== undefined) update.avatarUrl = dto.avatarUrl

    const user = await this.userModel
      .findByIdAndUpdate(userId, { $set: update }, { new: true })
      .select("-password -__v")
      .exec()

    if (!user) {
      throw new NotFoundException("Utilisateur non trouvé")
    }

    return user
  }

  async changeEmail(userId: string, dto: ChangeEmailDto) {
    const user = await this.userModel.findById(userId).exec()
    if (!user) {
      throw new NotFoundException("Utilisateur non trouvé")
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password)
    if (!isPasswordValid) {
      throw new UnauthorizedException("Mot de passe incorrect")
    }

    const newEmail = dto.newEmail.toLowerCase().trim()
    const existingUser = await this.userModel.exists({ email: newEmail }).lean()
    if (existingUser) {
      throw new ConflictException("Cet email est déjà utilisé")
    }

    user.email = newEmail
    await user.save()

    const { password: _password, __v: _v, ...rest } = user.toObject()
    return { message: "Email mis à jour avec succès", user: rest }
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userModel.findById(userId).exec()
    if (!user) {
      throw new NotFoundException("Utilisateur non trouvé")
    }

    const isPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.password
    )
    if (!isPasswordValid) {
      throw new UnauthorizedException("Mot de passe actuel incorrect")
    }

    user.password = await bcrypt.hash(dto.newPassword, 10)
    await user.save()

    return { message: "Mot de passe mis à jour avec succès" }
  }

  async getUserRecipes(userId: string, skip = 0, limit = 20) {
    this.validateObjectId(userId)

    const safeSkip = Math.max(0, skip)
    const safeLimit = Math.min(Math.max(1, limit), 100)

    const filter = { userId: new Types.ObjectId(userId) }

    const [data, total] = await Promise.all([
      this.recipeModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(safeSkip)
        .limit(safeLimit)
        .exec(),
      this.recipeModel.countDocuments(filter)
    ])

    return { data, total }
  }
}
