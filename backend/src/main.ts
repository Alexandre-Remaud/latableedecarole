import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { ConfigService } from "@nestjs/config"
import helmet from "helmet"
import { ValidationPipe } from "@nestjs/common"
import { Response, NextFunction } from "express"
import cookieParser from "cookie-parser"
import express from "express"
import * as path from "node:path"

const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000

export function setAuthCookies(res: Response, accessToken: string) {
  const isProduction = process.env.NODE_ENV === "production"
  res.cookie("access_token", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: ACCESS_TOKEN_MAX_AGE,
    path: "/"
  })
}

export function clearAuthCookies(res: Response) {
  const isProduction = process.env.NODE_ENV === "production"
  res.clearCookie("access_token", {
    path: "/",
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax"
  })
}

export function setRefreshCookie(res: Response, refreshToken: string) {
  const isProduction = process.env.NODE_ENV === "production"
  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: REFRESH_TOKEN_MAX_AGE,
    path: "/"
  })
}

export function clearRefreshCookie(res: Response) {
  const isProduction = process.env.NODE_ENV === "production"
  res.clearCookie("refresh_token", {
    path: "/",
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax"
  })
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

  app.use(
    "/uploads",
    (_req: unknown, res: Response, next: NextFunction) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin")
      next()
    },
    express.static(path.join(process.cwd(), "uploads"))
  )

  const port = configService.get<number>("PORT", 3000)
  try {
    await app.listen(port)
    console.log(`Server running on ${port}`)
  } catch (err) {
    console.error("Failed to start server:", err)
    process.exit(1)
  }
}
void bootstrap()
