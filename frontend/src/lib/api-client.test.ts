import { describe, it, expect, vi, beforeEach } from "vitest"
import { apiFetch, ApiError, NetworkError } from "./api-client"

describe("ApiError", () => {
  it("should have the correct properties", () => {
    const error = new ApiError("Bad request", 400, ["field is required"])

    expect(error.message).toBe("Bad request")
    expect(error.status).toBe(400)
    expect(error.details).toEqual(["field is required"])
    expect(error.name).toBe("ApiError")
    expect(error).toBeInstanceOf(Error)
  })
})

describe("NetworkError", () => {
  it("should have a default message", () => {
    const error = new NetworkError()

    expect(error.message).toBe(
      "Impossible de contacter le serveur. Vérifiez votre connexion."
    )
    expect(error.name).toBe("NetworkError")
    expect(error).toBeInstanceOf(Error)
  })

  it("should accept a custom message", () => {
    const error = new NetworkError("Custom message")
    expect(error.message).toBe("Custom message")
  })
})

describe("apiFetch", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("should return data on successful response", async () => {
    const data = { id: "1", title: "Test" }
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(data), { status: 200 })
    )

    const result = await apiFetch("/api/test")

    expect(result).toEqual(data)
  })

  it("should throw ApiError with string message on server error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: "Not found" }), { status: 404 })
    )

    try {
      await apiFetch("/api/test")
      expect.fail("Should have thrown")
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError)
      const apiError = error as ApiError
      expect(apiError.message).toBe("Not found")
      expect(apiError.status).toBe(404)
    }
  })

  it("should throw ApiError with first message from array (NestJS validation)", async () => {
    const validationErrors = {
      message: ["title must be a string", "description is required"],
      error: "Bad Request",
      statusCode: 400
    }
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(validationErrors), { status: 400 })
    )

    try {
      await apiFetch("/api/test")
      expect.fail("Should have thrown")
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError)
      const apiError = error as ApiError
      expect(apiError.message).toBe("title must be a string")
      expect(apiError.status).toBe(400)
      expect(apiError.details).toEqual([
        "title must be a string",
        "description is required"
      ])
    }
  })

  it("should throw ApiError with default message if response body is empty", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("invalid json", { status: 500 })
    )

    await expect(apiFetch("/api/test")).rejects.toMatchObject({
      message: "Erreur interne du serveur. Veuillez réessayer plus tard.",
      status: 500
    })
  })

  it("should throw NetworkError on network failure", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new TypeError("Failed to fetch")
    )

    await expect(apiFetch("/api/test")).rejects.toThrow(NetworkError)
  })

  it("should throw NetworkError on timeout", async () => {
    vi.useFakeTimers()

    // fetch never resolves — will be aborted by AbortController
    vi.spyOn(globalThis, "fetch").mockImplementation(
      (_url, options) =>
        new Promise((_resolve, reject) => {
          const signal = (options as RequestInit)?.signal
          if (signal) {
            signal.addEventListener("abort", () => {
              reject(
                new DOMException("The operation was aborted.", "AbortError")
              )
            })
          }
        })
    )

    const promise = apiFetch("/api/test", {}, 100)

    // Advance past the timeout
    vi.advanceTimersByTime(150)

    await expect(promise).rejects.toThrow(NetworkError)

    vi.useRealTimers()
  })
})
