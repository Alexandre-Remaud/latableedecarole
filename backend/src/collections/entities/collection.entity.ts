import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument, Types } from "mongoose"

export type CollectionDocument = HydratedDocument<Collection>

@Schema({ timestamps: true })
export class Collection {
  _id: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  userId: Types.ObjectId

  @Prop({ required: true, maxlength: 100 })
  name: string

  @Prop({ maxlength: 500 })
  description?: string

  @Prop({ default: false })
  isPublic: boolean

  @Prop({ type: [{ type: Types.ObjectId, ref: "Recipe" }], default: [] })
  recipeIds: Types.ObjectId[]

  @Prop()
  coverImage?: string

  createdAt: Date
  updatedAt: Date
}

export const CollectionSchema = SchemaFactory.createForClass(Collection)

CollectionSchema.index({ userId: 1 })
