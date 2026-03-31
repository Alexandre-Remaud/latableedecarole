import { validate } from "./env.validation"

const VALID_JWT_SECRET = "super-secret-key-at-least-32-characters-long"

describe("env.validation", () => {
  it("should validate a complete config", () => {
    const config = {
      MONGO_URI: "mongodb://localhost:27017/test",
      PORT: "5000",
      FRONTEND_URL: "http://localhost:5173",
      JWT_SECRET: VALID_JWT_SECRET
    }

    const result = validate(config)

    expect(result.MONGO_URI).toBe("mongodb://localhost:27017/test")
    expect(result.PORT).toBe(5000)
    expect(result.FRONTEND_URL).toBe("http://localhost:5173")
    expect(result.JWT_SECRET).toBe(VALID_JWT_SECRET)
  })

  it("should use default PORT 3000 when not provided", () => {
    const config = {
      MONGO_URI: "mongodb://localhost:27017/test",
      JWT_SECRET: VALID_JWT_SECRET
    }

    const result = validate(config)

    expect(result.PORT).toBe(3000)
  })

  it("should throw if MONGO_URI is missing", () => {
    expect(() => validate({ JWT_SECRET: VALID_JWT_SECRET })).toThrow(
      "Environment validation failed"
    )
  })

  it("should throw if MONGO_URI is empty", () => {
    expect(() =>
      validate({ MONGO_URI: "", JWT_SECRET: VALID_JWT_SECRET })
    ).toThrow("Environment validation failed")
  })

  it("should throw if PORT is not a valid number", () => {
    expect(() =>
      validate({
        MONGO_URI: "mongodb://localhost/test",
        PORT: "abc",
        JWT_SECRET: VALID_JWT_SECRET
      })
    ).toThrow("Environment validation failed")
  })

  it("should throw if PORT is out of range", () => {
    expect(() =>
      validate({
        MONGO_URI: "mongodb://localhost/test",
        PORT: "99999",
        JWT_SECRET: VALID_JWT_SECRET
      })
    ).toThrow("Environment validation failed")
  })

  it("should throw if FRONTEND_URL is not a valid URL", () => {
    expect(() =>
      validate({
        MONGO_URI: "mongodb://localhost/test",
        FRONTEND_URL: "not-a-url",
        JWT_SECRET: VALID_JWT_SECRET
      })
    ).toThrow("Environment validation failed")
  })

  it("should throw if JWT_SECRET is missing", () => {
    expect(() => validate({ MONGO_URI: "mongodb://localhost/test" })).toThrow(
      "Environment validation failed"
    )
  })
})
