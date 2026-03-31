import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { APP_GUARD } from "@nestjs/core"
import { RecipesModule } from "./recipes/recipes.module"
import { AuthModule } from "./auth/auth.module"
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard"
import { RolesGuard } from "./auth/guards/roles.guard"
import { validate } from "./config/env.validation"

@Module({
  imports: [
    ConfigModule.forRoot({ validate, isGlobal: true }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>("MONGO_URI")
      }),
      inject: [ConfigService]
    }),
    AuthModule,
    RecipesModule
  ],
  providers: [
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
