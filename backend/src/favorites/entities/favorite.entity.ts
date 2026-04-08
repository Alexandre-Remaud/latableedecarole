import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument, Types } from "mongoose"

export type FavoriteDocument = HydratedDocument<Favorite>

@Schema({ timestamps: true })
export class Favorite {
  _id: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  userId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: "Recipe", required: true })
  recipeId: Types.ObjectId

  createdAt: Date
}

export const FavoriteSchema = SchemaFactory.createForClass(Favorite)

FavoriteSchema.index({ userId: 1, recipeId: 1 }, { unique: true })
