import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { ConfigService } from "@nestjs/config"
import helmet from "helmet"
import { ValidationPipe } from "@nestjs/common"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  )

  app.use(helmet())
  app.enableCors({
    origin: configService.get<string>("FRONTEND_URL", "http://localhost:5173"),
    credentials: true
  })

  const port = configService.get<number>("PORT", 3000)
  try {
    await app.listen(port)
    console.log(`Server running on ${port}`)
  } catch (err) {
    console.error("Failed to start server:", err)
    process.exit(1)
  }
}
bootstrap()
