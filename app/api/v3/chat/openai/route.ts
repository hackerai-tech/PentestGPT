import {
  replaceWordsInLastUserMessage,
  updateOrAddSystemMessage,
  wordReplacements
} from "@/lib/ai-helper"
import {
  buildFinalMessages,
  filterEmptyAssistantMessages,
  toVercelChatMessages
} from "@/lib/build-prompt"
import llmConfig from "@/lib/models/llm/llm-config"
import { checkRatelimitOnApi } from "@/lib/server/ratelimiter"
import { getAIProfile } from "@/lib/server/server-chat-helpers"
import { executeCode } from "@/lib/tools/code-interpreter-utils"
import { createOpenAI } from "@ai-sdk/openai"
import { streamText, tool } from "ai"
import { ServerRuntime } from "next"
import { z } from "zod"

export const runtime: ServerRuntime = "edge"
export const preferredRegion = [
  "iad1",
  "arn1",
  "bom1",
  "cdg1",
  "cle1",
  "cpt1",
  "dub1",
  "fra1",
  "gru1",
  "hnd1",
  "icn1",
  "kix1",
  "lhr1",
  "pdx1",
  "sfo1",
  "sin1",
  "syd1"
]

export async function POST(request: Request) {
  try {
    const { payload, chatImages } = await request.json()
    const profile = await getAIProfile()

    const rateLimitCheckResult = await checkRatelimitOnApi(
      profile.user_id,
      "gpt-4"
    )
    if (rateLimitCheckResult !== null) {
      return rateLimitCheckResult.response
    }

    const userID = profile.user_id

    const cleanedMessages = await buildFinalMessages(
      payload,
      profile,
      chatImages,
      null
    )
    updateOrAddSystemMessage(
      cleanedMessages,
      llmConfig.systemPrompts.openaiChat
    )
    filterEmptyAssistantMessages(cleanedMessages)
    replaceWordsInLastUserMessage(cleanedMessages, wordReplacements)

    const openai = createOpenAI({
      baseUrl: llmConfig.openai.baseUrl,
      apiKey: llmConfig.openai.apiKey
    })

    let hasExecutedCode = false

    const result = await streamText({
      model: openai("gpt-4o-2024-08-06"),
      temperature: 0.4,
      maxTokens: 1024,
      messages: toVercelChatMessages(cleanedMessages, true),
      // abortSignal isn't working for some reason.
      abortSignal: request.signal,
      experimental_toolCallStreaming: true,
      tools: {
        webSearch: {
          description: "Search the web for latest information",
          parameters: z.object({ search: z.boolean() })
        },
        runPython: tool({
          description: "Runs Python code.",
          parameters: z.object({
            code: z
              .string()
              .describe("The python code to execute in a single cell.")
          }),
          async execute({ code }) {
            if (hasExecutedCode) {
              return {
                results:
                  "Code execution skipped. Only one code cell can be executed per request.",
                runtimeError: null
              }
            }

            hasExecutedCode = true
            const execOutput = await executeCode(userID, code)
            const { results, error: runtimeError } = execOutput

            return {
              results,
              runtimeError
            }
          }
        })
      },
      toolChoice: "auto"
    })

    return result.toDataStreamResponse()
  } catch (error: any) {
    const errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500

    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
