import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument, Types } from "mongoose"
import { Role } from "../../auth/role.enum"

export type UserDocument = HydratedDocument<User>

@Schema({ timestamps: true })
export class User {
  _id: Types.ObjectId

  @Prop({ required: true, unique: true })
  email: string

  @Prop({ required: true })
  password: string

  @Prop({ required: true })
  name: string

  @Prop({ type: String, enum: Role, default: Role.USER })
  role: Role

  createdAt: Date
  updatedAt: Date
}

export const UserSchema = SchemaFactory.createForClass(User)
