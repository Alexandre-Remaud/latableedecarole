import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { ConfigService } from "@nestjs/config"
import helmet from "helmet"
import { ValidationPipe } from "@nestjs/common"
import { Response } from "express"
import cookieParser from "cookie-parser"

export function setAuthCookies(res: Response, accessToken: string) {
  res.cookie("access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/"
  })
}

export function clearAuthCookies(res: Response) {
  res.clearCookie("access_token", { path: "/" })
}

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

  app.use(cookieParser())
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
