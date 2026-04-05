import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument, Types } from "mongoose"

export type ImageDocument = HydratedDocument<Image>

@Schema({ timestamps: true })
export class Image {
  _id: Types.ObjectId

  @Prop({ required: true })
  originalUrl: string

  @Prop({ required: true })
  thumbnailUrl: string

  @Prop({ required: true })
  mediumUrl: string

  @Prop({ required: true, unique: true })
  publicId: string

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  userId: Types.ObjectId

  createdAt: Date
  updatedAt: Date
}

export const ImageSchema = SchemaFactory.createForClass(Image)
