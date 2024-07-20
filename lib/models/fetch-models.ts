import { LLM } from "@/types"
import { LLM_LIST_MAP } from "./llm/llm-list"

export const fetchHostedModels = async () => {
  try {
    const isUsingEnvKeyMap = {
      openai: true,
      mistral: true,
      openrouter: true,
      openai_organization_id: false
    }

    let modelsToAdd: LLM[] = []

    for (const provider in isUsingEnvKeyMap) {
      if (isUsingEnvKeyMap[provider as keyof typeof isUsingEnvKeyMap]) {
        const models = LLM_LIST_MAP[provider as keyof typeof LLM_LIST_MAP]

        if (Array.isArray(models)) {
          modelsToAdd.push(...models)
        }
      }
    }

    return {
      envKeyMap: isUsingEnvKeyMap,
      hostedModels: modelsToAdd
    }
  } catch (error) {
    console.warn("Error fetching hosted models: " + error)
  }
}
