import { Tables } from "@/supabase/types"

export interface ChatMessage {
  message: Tables<"messages">
  fileItems: Tables<"file_items">[]
  feedback?: Tables<"feedback">
}

export interface ImageContent {
  type: "image_url"
  image_url: {
    url: string
  }
}

export interface TextContent {
  type: "text"
  text: string
}

export interface BuiltChatMessage {
  role: string
  content: string | ImageContent[] | TextContent[]
}
