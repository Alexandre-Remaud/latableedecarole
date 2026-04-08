import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument, Types } from "mongoose"

export type ReviewDocument = HydratedDocument<Review>

@Schema({ timestamps: true })
export class Review {
  _id: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  userId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: "Recipe", required: true })
  recipeId: Types.ObjectId

  @Prop({ required: true, min: 1, max: 5 })
  rating: number

  @Prop({ maxlength: 1000 })
  comment?: string

  createdAt: Date
  updatedAt: Date
}

export const ReviewSchema = SchemaFactory.createForClass(Review)

ReviewSchema.index({ userId: 1, recipeId: 1 }, { unique: true })
