import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { APP_GUARD } from "@nestjs/core"
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler"
import { RecipesModule } from "./recipes/recipes.module"
import { AuthModule } from "./auth/auth.module"
import { UploadModule } from "./upload/upload.module"
import { UsersModule } from "./users/users.module"
import { FavoritesModule } from "./favorites/favorites.module"
import { ReviewsModule } from "./reviews/reviews.module"
import { ShoppingListsModule } from "./shopping-lists/shopping-lists.module"
import { CollectionsModule } from "./collections/collections.module"
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard"
import { RolesGuard } from "./auth/guards/roles.guard"
import { validate } from "./config/env.validation"
import { AppController } from "./app.controller"

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({ validate, isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        name: "default",
        ttl: 60000,
        limit: 100
      }
    ]),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>("MONGO_URI"),
        dbName: configService.get<string>("MONGO_DB_NAME")
      }),
      inject: [ConfigService]
    }),
    AuthModule,
    RecipesModule,
    UploadModule,
    UsersModule,
    FavoritesModule,
    ReviewsModule,
    ShoppingListsModule,
    CollectionsModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard
    }
  ]
})
export class AppModule {}
