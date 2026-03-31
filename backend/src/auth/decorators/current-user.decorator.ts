import { createParamDecorator, ExecutionContext } from "@nestjs/common"
import type { JwtPayload } from "../auth.service"

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    const user = request.user
    if (!user) return undefined
    return data ? user[data as keyof JwtPayload] : user
  }
)
