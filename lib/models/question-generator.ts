import { filterEmptyAssistantMessages } from "@/lib/build-prompt"
import { createOpenAI } from "@ai-sdk/openai"
import { generateText } from "ai"
import endent from "endent"

export async function generateStandaloneQuestion(
  messages: any[],
  latestUserMessage: any,
  openRouterBaseUrl: string | undefined,
  openRouterHeaders: any,
  selectedStandaloneQuestionModel: string | undefined,
  systemMessageContent: string,
  generateAtomicQuestions: boolean = false,
  numAtomicQuestions: number = 4
) {
  if (!openRouterBaseUrl || !selectedStandaloneQuestionModel) {
    console.error(
      "Missing openRouterBaseUrl or selectedStandaloneQuestionModel"
    )
    return {
      standaloneQuestion: latestUserMessage,
      atomicQuestions: [latestUserMessage]
    }
  }

  filterEmptyAssistantMessages(messages)

  let chatHistory = messages
    .slice(1, -1) // Remove the first (system prompt) and the last message (user message)
    .slice(-3) // Get the last 3 messages only (assistant, user, assistant)
    .map(msg => `${msg.role}: ${msg.content}`)
    .join("\n")

  // Compressed prompt with HyDE
  let template = ""

  if (generateAtomicQuestions) {
    template = endent`
      Your are PentestGPT is an expert in hacking, particularly in the areas of bug bounty, hacking, penetration testing. You are having a conversation with an user and you want to enrich your answer with some expert knowledge.
      Objective 1: Craft a standalone question for a specialist who is unfamiliar with the conversation, based on the given follow-up question and chat history. The question should:
    
      1. Emphasize relevant keywords
      2. Seek specific actions or information 
      3. Provide full context while being concise
      4. Be phrased as a clear, direct question
      5. Exclude irrelevant details
      6. Don't include something like: "in web applications" to ensure the questions are cleaner and more direct.

      Objective 2: Generate up to ${numAtomicQuestions} atomic questions to gather information to answer the standalone question. The questions should:
      1. Diverse, standalone and atomic
      2. Simple questions with a single subject
    
      Input:
      - Chat History: """${chatHistory}"""
      - Follow Up: """${latestUserMessage}"""
    
      Output:The rephrased standalone question to ask the specialist. Use the following format:
      <Standalone Question>{Your standalone question here}</Standalone Question>
      <Atomic Questions>
        <Atomic Question>{Your atomic question here}</Atomic Question>
        <Atomic Question>{Your atomic question here}</Atomic Question>
      </Atomic Questions>`
  }

  try {
    const openai = createOpenAI({
      baseURL: openRouterBaseUrl,
      headers: {
        ...openRouterHeaders,
        "HTTP-Referer": "https://pentestgpt.com/question-generator",
        "X-Title": "question-generator"
      }
    })

    const result = await generateText({
      model: openai(selectedStandaloneQuestionModel),
      temperature: 0.4,
      maxTokens: 1024,
      messages: [
        { role: "system", content: systemMessageContent },
        { role: "user", content: template }
      ]
    })

    const returnText = result.text

    let standaloneQuestion = ""
    let atomicQuestions: string[] = []

    if (
      returnText.includes("<Standalone Question>") &&
      returnText.includes("</Standalone Question>")
    ) {
      standaloneQuestion = returnText
        .split("<Standalone Question>")[1]
        .split("</Standalone Question>")[0]
        .trim()
    }

    if (
      generateAtomicQuestions &&
      returnText.includes("<Atomic Questions>") &&
      returnText.includes("</Atomic Questions>")
    ) {
      const atomicQuestionsSection = returnText
        .split("<Atomic Questions>")[1]
        .split("</Atomic Questions>")[0]

      atomicQuestions = atomicQuestionsSection
        .split("<Atomic Question>")
        .filter((question: string) => question.trim() !== "")
        .map((question: string) =>
          question.split("</Atomic Question>")[0].trim()
        )
    } else {
      atomicQuestions = [standaloneQuestion]
    }

    return { standaloneQuestion, atomicQuestions }
  } catch (error) {
    console.error("Error in generateStandaloneQuestion:", error)
    return {
      standaloneQuestion: latestUserMessage,
      atomicQuestions: [latestUserMessage]
    }
  }
}
