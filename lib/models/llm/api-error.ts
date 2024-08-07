export class APIError extends Error {
  code: any
  constructor(message: string | undefined, code: any) {
    super(message)
    this.name = "APIError"
    this.code = code
  }
}

export async function handleOpenAIApiError(res: Response) {
  const result = await res.json()
  const errorMessage = result.error?.message || "An unknown error occurred"

  // Log the detailed error for internal use
  console.error(`API Error: ${res.status} - ${errorMessage}`)

  switch (res.status) {
    case 401:
      if (errorMessage.includes("Invalid Authentication")) {
        throw new APIError(
          "Invalid Authentication. Please check your API key and organization.",
          401
        )
      } else if (errorMessage.includes("Incorrect API key provided")) {
        throw new APIError(
          "Incorrect API key provided. Please verify your API key.",
          401
        )
      } else if (
        errorMessage.includes(
          "You must be a member of an organization to use the API"
        )
      ) {
        throw new APIError(
          "You must be a member of an organization to use the API. Contact support for assistance.",
          401
        )
      }
      break
    case 403:
      throw new APIError(
        "Access from your country, region, or territory is not supported.",
        403
      )
    case 429:
      if (errorMessage.includes("Rate limit reached for requests")) {
        throw new APIError(
          "Rate limit reached. Please slow down your requests.",
          429
        )
      } else if (errorMessage.includes("You exceeded your current quota")) {
        throw new APIError(
          "Quota exceeded. Please check your plan and billing details.",
          429
        )
      }
      break
    case 500:
      throw new APIError("Server error. Please try again later.", 500)
    case 503:
      throw new APIError(
        "Service is currently overloaded. Please try again later.",
        503
      )
    default:
      throw new APIError(
        "An unexpected error occurred. Please try again.",
        res.status
      )
  }
}

export async function handleOpenRouterApiError(res: Response) {
  const result = await res.json()
  const errorMessage = result.error?.message || "An unknown error occurred"

  // Log the detailed error for internal use
  console.error(`OpenRouter API Error: ${res.status} - ${errorMessage}`)

  switch (res.status) {
    case 400:
      throw new APIError("Bad Request: Invalid or missing parameters.", 400)
    case 401:
      throw new APIError(
        "Invalid credentials: OAuth session expired or invalid API key.",
        401
      )
    case 402:
      throw new APIError(
        "Insufficient credits: Add more credits and retry.",
        402
      )
    case 403:
      throw new APIError("Moderation required: Your input was flagged.", 403)
    case 408:
      throw new APIError("Request timed out.", 408)
    case 429:
      throw new APIError("Rate limited: Slow down your requests.", 429)
    case 502:
      throw new APIError("Model down or invalid response received.", 502)
    case 503:
      throw new APIError(
        "No available model provider meets your routing requirements.",
        503
      )
    default:
      throw new APIError(
        "An unexpected error occurred. Please try again.",
        res.status
      )
  }
}

export function handleErrorResponse(error: any) {
  if (error instanceof APIError) {
    console.error(`API Error - Code: ${error.code}, Message: ${error.message}`)
  } else if (error instanceof Error) {
    console.error(`Unexpected Error: ${error.message}`)
  } else {
    console.error(`An unknown error occurred: ${error}`)
  }

  return new Response(
    JSON.stringify({
      message:
        error instanceof APIError ? error.message : "An unknown error occurred"
    }),
    {
      status: error instanceof APIError ? error.code : 500
    }
  )
}
