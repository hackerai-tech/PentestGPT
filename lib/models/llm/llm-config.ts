import {
  getPentestGPTInfo,
  getPentestGPTSystemPromptEnding,
  getPentestGPTToolsInfo
} from "./llm-prompting"

const KnowledgeCutOFFOpenAI = "Knowledge cutoff: 2023-10"
const KnowledgeCutOFFMeta = "Knowledge cutoff: 2023-12"
const options: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "long",
  day: "numeric"
}
const currentDate = `Current date: ${new Date().toLocaleDateString("en-US", options)}`

const initialSystemPrompt = `${process.env.SECRET_PENTESTGPT_SYSTEM_PROMPT}`

const llmConfig = {
  openrouter: {
    baseUrl: "https://openrouter.ai/api/v1",
    url: `https://openrouter.ai/api/v1/chat/completions`,
    providerRouting: {
      order: [`${process.env.OPENROUTER_FIRST_PROVIDER}`]
    },
    apiKey: process.env.OPENROUTER_API_KEY
  },
  openai: {
    baseUrl: "https://api.openai.com/v1",
    url: "https://api.openai.com/v1/chat/completions",
    apiKey: process.env.OPENAI_API_KEY
  },
  systemPrompts: {
    pentestGPTChat: `${getPentestGPTInfo(initialSystemPrompt)}\n${getPentestGPTSystemPromptEnding}`,
    openaiChat: `${getPentestGPTInfo(initialSystemPrompt)}\n${getPentestGPTToolsInfo}\n${getPentestGPTSystemPromptEnding}`,
    pentestGPTWebSearch: `${getPentestGPTInfo(initialSystemPrompt, false, true)}\n${getPentestGPTSystemPromptEnding}`,
    pentestgpt: `${process.env.SECRET_PENTESTGPT_SYSTEM_PROMPT}\n${KnowledgeCutOFFMeta}\n${currentDate}`,
    pentestgptCurrentDateOnly: `${process.env.SECRET_PENTESTGPT_SYSTEM_PROMPT}\n${currentDate}`,
    openai: `${process.env.SECRET_OPENAI_SYSTEM_PROMPT}\n${KnowledgeCutOFFOpenAI}\n${currentDate}`,
    openaiCurrentDateOnly: `${process.env.SECRET_OPENAI_SYSTEM_PROMPT}\n${currentDate}`,
    RAG: `${process.env.SECRET_PENTESTGPT_SYSTEM_PROMPT} ${process.env.RAG_SYSTEM_PROMPT}\n${currentDate}`
  },
  models: {
    pentestgpt_default_openrouter:
      process.env.OPENROUTER_PENTESTGPT_DEFUALT_MODEL,
    pentestgpt_RAG_openrouter: process.env.OPENROUTER_PENTESTGPT_RAG_MODEL,
    pentestgpt_standalone_question_openrouter:
      process.env.OPENROUTER_STANDALONE_QUESTION_MODEL,
    pentestgpt_pro_openrouter: process.env.OPENROUTER_PENTESTGPT_PRO_MODEL
  },
  hackerRAG: {
    enabled:
      (process.env.HACKER_RAG_ENABLED?.toLowerCase() || "false") === "true",
    endpoint: process.env.HACKER_RAG_ENDPOINT,
    getDataEndpoint: process.env.HACKER_RAG_GET_DATA_ENDPOINT,
    apiKey: process.env.HACKER_RAG_API_KEY,
    messageLength: {
      min: parseInt(process.env.MIN_LAST_MESSAGE_LENGTH || "25", 10),
      max: parseInt(process.env.MAX_LAST_MESSAGE_LENGTH || "1000", 10)
    }
  }
}

export default llmConfig
