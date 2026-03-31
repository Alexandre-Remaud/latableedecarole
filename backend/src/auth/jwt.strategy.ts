import { Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"
import { ConfigService } from "@nestjs/config"
import type { Request } from "express"
import type { JwtPayload } from "./auth.service"

interface RequestWithCookies extends Request {
  cookies: Record<string, string>
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: RequestWithCookies | undefined) => {
          if (req && req.cookies && "access_token" in req.cookies) {
            return req.cookies.access_token
          }
          return null
        }
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_SECRET")!
    })
  }

  validate(payload: JwtPayload): JwtPayload {
    return payload
  }
}
