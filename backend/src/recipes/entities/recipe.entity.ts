import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument, Types } from "mongoose"

export type RecipeDocument = HydratedDocument<Recipe>

@Schema({ _id: false })
class Step {
  @Prop({ required: true })
  order: number

  @Prop({ required: true })
  instruction: string

  @Prop()
  duration?: number

  @Prop()
  durationUnit?: "min" | "sec"

  @Prop()
  temperature?: number

  @Prop()
  temperatureUnit?: "C" | "F"

  @Prop()
  note?: string
}

@Schema({ _id: false })
class Ingredient {
  @Prop({ required: true })
  name: string

  @Prop({ required: true })
  quantity: number

  @Prop({ required: true })
  unit: string
}

@Schema({ timestamps: true })
export class Recipe {
  _id: Types.ObjectId

  @Prop({ required: true })
  title: string

  @Prop({ required: true })
  description: string

  @Prop({ type: [Ingredient], required: true })
  ingredients: Ingredient[]

  @Prop({ type: [Step], required: true })
  steps: Step[]

  @Prop()
  imageUrl?: string

  @Prop()
  imageThumbnailUrl?: string

  @Prop()
  imageMediumUrl?: string

  @Prop()
  imagePublicId?: string

  @Prop({ default: 0 })
  prepTime?: number

  @Prop({ default: 0 })
  cookTime?: number

  @Prop({ default: 4 })
  servings?: number

  @Prop({ type: String, enum: ["easy", "medium", "hard"] })
  difficulty?: string

  @Prop({
    type: String,
    enum: [
      "appetizer",
      "starter",
      "main_course",
      "side_dish",
      "dessert",
      "snack",
      "beverage",
      "sauce"
    ]
  })
  category?: string

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  userId: Types.ObjectId

  createdAt: Date
  updatedAt: Date
}

export const RecipeSchema = SchemaFactory.createForClass(Recipe)

RecipeSchema.pre<RecipeDocument>("save", function () {
  if (this.steps && this.steps.length > 0) {
    this.cookTime = this.steps.reduce((total, step) => {
      return total + (step.duration ?? 0)
    }, 0)
  }
})
