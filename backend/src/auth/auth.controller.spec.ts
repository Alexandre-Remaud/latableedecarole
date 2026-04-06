import { Test, TestingModule } from "@nestjs/testing"
import { HttpStatus } from "@nestjs/common"
import { AuthController } from "./auth.controller"
import { AuthService } from "./auth.service"
import { Role } from "./role.enum"
import type { Response, Request } from "express"

jest.mock("../main", () => ({
  setAuthCookies: jest.fn(),
  clearAuthCookies: jest.fn(),
  setRefreshCookie: jest.fn(),
  clearRefreshCookie: jest.fn()
}))

import {
  setAuthCookies,
  clearAuthCookies,
  setRefreshCookie,
  clearRefreshCookie
} from "../main"

describe("AuthController", () => {
  let controller: AuthController
  let authService: Record<string, jest.Mock>

  const mockRes = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis()
  } as unknown as Response

  const mockUser = {
    _id: "user-id",
    email: "test@example.com",
    name: "Test",
    role: Role.USER
  }

  beforeEach(async () => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
      refreshTokens: jest.fn(),
      logout: jest.fn()
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }]
    }).compile()

    controller = module.get<AuthController>(AuthController)
    jest.clearAllMocks()
  })

  describe("register", () => {
    it("should register and set cookies", async () => {
      authService.register.mockResolvedValue({
        user: mockUser,
        accessToken: "at",
        refreshToken: "rt"
      })

      const result = await controller.register(
        { email: "test@example.com", password: "Password1", name: "Test" },
        mockRes
      )

      expect(authService.register).toHaveBeenCalled()
      expect(setAuthCookies).toHaveBeenCalledWith(mockRes, "at")
      expect(setRefreshCookie).toHaveBeenCalledWith(mockRes, "rt")
      expect(result).toEqual({ user: mockUser })
    })
  })

  describe("login", () => {
    it("should login and set cookies", async () => {
      authService.login.mockResolvedValue({
        user: mockUser,
        accessToken: "at",
        refreshToken: "rt"
      })

      const result = await controller.login(
        { email: "test@example.com", password: "Password1" },
        mockRes
      )

      expect(setAuthCookies).toHaveBeenCalledWith(mockRes, "at")
      expect(setRefreshCookie).toHaveBeenCalledWith(mockRes, "rt")
      expect(result).toEqual({ user: mockUser })
    })
  })

  describe("refresh", () => {
    it("should refresh tokens when cookie present", async () => {
      const mockReq = {
        cookies: { refresh_token: "rt" }
      } as unknown as Request

      authService.refreshTokens.mockResolvedValue({
        accessToken: "new-at",
        refreshToken: "new-rt"
      })

      const result = await controller.refresh(mockReq, mockRes)

      expect(authService.refreshTokens).toHaveBeenCalledWith("rt")
      expect(setAuthCookies).toHaveBeenCalledWith(mockRes, "new-at")
      expect(setRefreshCookie).toHaveBeenCalledWith(mockRes, "new-rt")
      expect(result).toEqual({ message: "Tokens refreshed" })
    })

    it("should return 401 when refresh cookie is missing", async () => {
      const mockReq = { cookies: {} } as unknown as Request

      await controller.refresh(mockReq, mockRes)

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED)

      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Refresh token manquant"
      })
    })
  })

  describe("logout", () => {
    it("should logout and clear cookies", async () => {
      authService.logout.mockResolvedValue(undefined)

      const result = await controller.logout(mockRes, {
        sub: "user-id",
        email: "test@example.com",
        name: "Test",
        role: Role.USER
      })

      expect(authService.logout).toHaveBeenCalledWith("user-id")
      expect(clearAuthCookies).toHaveBeenCalledWith(mockRes)
      expect(clearRefreshCookie).toHaveBeenCalledWith(mockRes)
      expect(result).toEqual({ message: "Déconnexion réussie" })
    })
  })

  describe("getProfile", () => {
    it("should return user profile from JWT payload", () => {
      const payload = {
        sub: "user-id",
        email: "test@example.com",
        name: "Test",
        role: Role.USER
      }

      const result = controller.getProfile(payload)

      expect(result).toEqual({
        id: "user-id",
        email: "test@example.com",
        name: "Test",
        role: Role.USER
      })
    })
  })
})
