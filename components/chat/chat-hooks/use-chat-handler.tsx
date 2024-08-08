import { useAlertContext } from "@/context/alert-context"
import { PentestGPTContext } from "@/context/context"
import { updateChat } from "@/db/chats"
import { Tables, TablesInsert } from "@/supabase/types"
import { ChatMessage, ChatPayload, LLMID } from "@/types"
import { PluginID } from "@/types/plugins"
import { useRouter } from "next/navigation"
import { useContext, useEffect, useRef } from "react"
import { toast } from "sonner"
import { LLM_LIST } from "../../../lib/models/llm/llm-list"

import { createMessageFeedback } from "@/db/message-feedback"
import {
  createTempMessages,
  handleCreateChat,
  handleCreateMessages,
  handleHostedChat,
  handleHostedPluginsChat,
  handleRetrieval,
  validateChatSettings
} from "../chat-helpers"

export const useChatHandler = () => {
  const router = useRouter()
  const { dispatch: alertDispatch } = useAlertContext()

  const {
    userInput,
    chatFiles,
    setUserInput,
    setNewMessageImages,
    profile,
    setIsGenerating,
    setChatMessages,
    setFirstTokenReceived,
    selectedChat,
    selectedWorkspace,
    setSelectedChat,
    setChats,
    abortController,
    setAbortController,
    chatSettings,
    newMessageImages,
    chatMessages,
    chatImages,
    setChatImages,
    setChatFiles,
    setNewMessageFiles,
    setShowFilesDisplay,
    newMessageFiles,
    setToolInUse,
    useRetrieval,
    sourceCount,
    setIsAtPickerOpen,
    setChatSettings,
    isAtPickerOpen,
    isGenerating,
    setUseRetrieval,
    setIsReadyToChat
  } = useContext(PentestGPTContext)

  let { selectedPlugin } = useContext(PentestGPTContext)

  const isGeneratingRef = useRef(isGenerating)

  useEffect(() => {
    isGeneratingRef.current = isGenerating
  }, [isGenerating])

  const chatInputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!isAtPickerOpen) {
      chatInputRef.current?.focus()
    }
  }, [isAtPickerOpen])

  // Initialize chat settings on component mount
  useEffect(() => {
    if (selectedChat && selectedChat.model) {
      setChatSettings(prevSettings => ({
        ...prevSettings,
        model: selectedChat.model as LLMID
      }))
    }
  }, [selectedChat, setChatSettings])

  const handleSelectChat = async (chat: Tables<"chats">) => {
    if (!selectedWorkspace) return
    await handleStopMessage()
    setIsReadyToChat(false)

    if (chat.model) {
      setChatSettings(prevSettings => ({
        ...prevSettings,
        model: chat.model as LLMID
      }))
    }

    return router.push(`/${selectedWorkspace.id}/chat/${chat.id}`)
  }

  const handleNewChat = async () => {
    if (!selectedWorkspace) return

    await handleStopMessage()

    setUserInput("")
    setChatMessages([])
    setSelectedChat(null)

    setIsGenerating(false)
    setFirstTokenReceived(false)

    setChatFiles([])
    setChatImages([])
    setNewMessageFiles([])
    setNewMessageImages([])
    setShowFilesDisplay(false)
    setIsAtPickerOpen(false)
    setUseRetrieval(false)

    setToolInUse("none")

    setIsReadyToChat(true)
    return router.push(`/${selectedWorkspace.id}/chat`)
  }

  const handleFocusChatInput = () => {
    chatInputRef.current?.focus()
  }

  const handleStopMessage = async () => {
    if (abortController && !abortController.signal.aborted) {
      abortController.abort()
      while (isGeneratingRef.current) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  const handleSendFeedback = async (
    chatMessage: ChatMessage,
    feedback: "good" | "bad",
    reason?: string,
    detailedFeed?: string,
    allow_email?: boolean,
    allow_sharing?: boolean
  ) => {
    const feedbackInsert: TablesInsert<"feedback"> = {
      message_id: chatMessage.message.id,
      user_id: chatMessage.message.user_id,
      chat_id: chatMessage.message.chat_id,
      feedback: feedback,
      reason: reason ?? chatMessage.feedback?.reason,
      detailed_feedback:
        detailedFeed ?? chatMessage.feedback?.detailed_feedback,
      model: chatMessage.message.model,
      created_at: chatMessage.feedback?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sequence_number: chatMessage.message.sequence_number,
      allow_email: allow_email,
      allow_sharing: allow_sharing,
      has_files: chatMessage.fileItems.length > 0,
      plugin: chatMessage.message.plugin || PluginID.NONE,
      rag_used: chatMessage.message.rag_used,
      rag_id: chatMessage.message.rag_id
    }
    const newFeedback = await createMessageFeedback(feedbackInsert)
    setChatMessages((prevMessages: ChatMessage[]) =>
      prevMessages.map((message: ChatMessage) =>
        message.message.id === chatMessage.message.id
          ? { ...message, feedback: newFeedback[0] }
          : message
      )
    )
  }

  const handleSendContinuation = async () => {
    await handleSendMessage(null, chatMessages, false, true)
  }

  const handleSendMessage = async (
    messageContent: string | null,
    chatMessages: ChatMessage[],
    isRegeneration: boolean,
    isContinuation: boolean = false,
    editSequenceNumber?: number,
    model?: LLMID
  ) => {
    const isEdit = editSequenceNumber !== undefined
    const isRagEnabled = selectedPlugin === PluginID.ENHANCED_SEARCH

    try {
      if (!isRegeneration) {
        setUserInput("")
      }

      setIsGenerating(!isContinuation)
      setIsAtPickerOpen(false)
      setNewMessageImages([])

      const newAbortController = new AbortController()
      setAbortController(newAbortController)

      const modelData = [...LLM_LIST].find(
        llm => llm.modelId === (model || chatSettings?.model)
      )

      validateChatSettings(
        chatSettings,
        modelData,
        profile,
        selectedWorkspace,
        isContinuation,
        messageContent
      )

      if (chatSettings && !isRegeneration) {
        chatSettings.model = model || chatSettings.model
      }

      let currentChat = selectedChat ? { ...selectedChat } : null

      const b64Images = newMessageImages.map(image => image.base64)

      const { tempUserChatMessage, tempAssistantChatMessage } =
        createTempMessages(
          messageContent,
          chatMessages,
          chatSettings!,
          b64Images,
          isContinuation,
          selectedPlugin,
          model || chatSettings!.model
        )

      let sentChatMessages = [...chatMessages]

      // If the message is an edit, remove all following messages
      if (isEdit) {
        sentChatMessages = sentChatMessages.filter(
          chatMessage =>
            chatMessage.message.sequence_number < editSequenceNumber
        )
      }

      if (isRegeneration) {
        sentChatMessages.pop()
        sentChatMessages.push(tempAssistantChatMessage)
      } else {
        sentChatMessages.push(tempUserChatMessage)
        if (!isContinuation) sentChatMessages.push(tempAssistantChatMessage)
      }

      // Update the UI with the new messages
      if (!isContinuation) setChatMessages(sentChatMessages)

      let retrievedFileItems: Tables<"file_items">[] = []

      if (
        (newMessageFiles.length > 0 || chatFiles.length > 0) &&
        useRetrieval &&
        !isContinuation
      ) {
        setToolInUse("retrieval")

        retrievedFileItems = await handleRetrieval(
          userInput,
          newMessageFiles,
          chatFiles,
          chatSettings!.embeddingsProvider,
          sourceCount
        )
      }

      let payload: ChatPayload = {
        chatSettings: {
          ...chatSettings!,
          model: model || chatSettings!.model
        },
        chatMessages: sentChatMessages,
        messageFileItems: retrievedFileItems
      }

      let generatedText = ""
      let finishReasonFromResponse = ""
      let ragUsed = false
      let ragId = null

      let detectedModerationLevel = -1
      if (
        !isContinuation &&
        (selectedPlugin === PluginID.NONE ||
          selectedPlugin === PluginID.ENHANCED_SEARCH ||
          selectedPlugin === PluginID.WEB_SEARCH) &&
        modelData?.provider !== "openai"
      ) {
        const result = await handleDetectPlugin(payload, selectedPlugin)
        if (result === null) {
          // If handleDetectPlugin returns null, it means a 429 error occurred
          // We've already shown the alert, so we should exit the function
          setIsGenerating(false)
          setFirstTokenReceived(false)
          setChatMessages(chatMessages)
          return
        }
        selectedPlugin = result.detectedPlugin
        detectedModerationLevel = result.moderationLevel
      }

      if (
        selectedPlugin.length > 0 &&
        selectedPlugin !== PluginID.NONE &&
        selectedPlugin !== PluginID.WEB_SEARCH &&
        selectedPlugin !== PluginID.ENHANCED_SEARCH
      ) {
        let fileData: { fileName: string; fileContent: string }[] = []

        const nonExcludedPluginsForFilesCommand = [
          PluginID.NUCLEI,
          PluginID.KATANA
        ]

        const isCommand = (allowedCommands: string[], message: string) => {
          if (!message.startsWith("/")) return false
          const trimmedMessage = message.trim().toLowerCase()

          // Check if the message matches any of the allowed commands
          return allowedCommands.some(commandName => {
            const commandPattern = new RegExp(
              `^\\/${commandName}(?:\\s+(-[a-z]+|\\S+))*$`
            )
            return commandPattern.test(trimmedMessage)
          })
        }

        if (
          messageContent &&
          newMessageFiles.length > 0 &&
          newMessageFiles[0].type === "text" &&
          (nonExcludedPluginsForFilesCommand.includes(selectedPlugin) ||
            isCommand(nonExcludedPluginsForFilesCommand, messageContent))
        ) {
          const fileIds = newMessageFiles
            .filter(file => file.type === "text")
            .map(file => file.id)

          if (fileIds.length > 0) {
            const response = await fetch(`/api/retrieval/file-2v`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ fileIds: fileIds })
            })

            if (!response.ok) {
              const errorData = await response.json()
              toast.warning(errorData.message)
            }

            const data = await response.json()
            fileData.push(...data.files)
          }
        }

        const { fullText, finishReason } = await handleHostedPluginsChat(
          payload,
          profile!,
          modelData!,
          tempAssistantChatMessage,
          isRegeneration,
          newAbortController,
          newMessageImages,
          chatImages,
          setIsGenerating,
          setFirstTokenReceived,
          setChatMessages,
          setToolInUse,
          alertDispatch,
          selectedPlugin,
          fileData
        )
        generatedText = fullText
        finishReasonFromResponse = finishReason
      } else {
        const {
          fullText,
          finishReason,
          ragUsed: ragUsedFromResponse,
          ragId: ragIdFromResponse,
          selectedPlugin: updatedSelectedPlugin
        } = await handleHostedChat(
          payload,
          modelData!,
          tempAssistantChatMessage,
          isRegeneration,
          isRagEnabled,
          isContinuation,
          newAbortController,
          chatImages,
          setIsGenerating,
          setFirstTokenReceived,
          setChatMessages,
          setToolInUse,
          alertDispatch,
          selectedPlugin,
          detectedModerationLevel
        )
        generatedText = fullText
        finishReasonFromResponse = finishReason
        ragUsed = ragUsedFromResponse
        ragId = ragIdFromResponse
        selectedPlugin = updatedSelectedPlugin
      }

      if (!currentChat) {
        currentChat = await handleCreateChat(
          chatSettings!,
          profile!,
          selectedWorkspace!,
          messageContent || "",
          newMessageFiles,
          finishReasonFromResponse,
          setSelectedChat,
          setChats,
          setChatFiles
        )
      } else {
        const updatedChat = await updateChat(currentChat.id, {
          updated_at: new Date().toISOString(),
          finish_reason: finishReasonFromResponse,
          model: chatSettings?.model
        })

        setChats(prevChats => {
          const updatedChats = prevChats.map(prevChat =>
            prevChat.id === updatedChat.id ? updatedChat : prevChat
          )

          return updatedChats
        })

        if (selectedChat?.id === updatedChat.id) {
          setSelectedChat(updatedChat)
        }
      }

      await handleCreateMessages(
        chatMessages,
        currentChat,
        profile!,
        modelData!,
        messageContent,
        generatedText,
        newMessageImages,
        isRegeneration,
        isContinuation,
        retrievedFileItems,
        setChatMessages,
        setChatImages,
        selectedPlugin,
        editSequenceNumber,
        ragUsed,
        ragId
      )

      setIsGenerating(false)
      setFirstTokenReceived(false)
    } catch (error) {
      setIsGenerating(false)
      setFirstTokenReceived(false)
      // Restore the chat messages to the previous state
      setChatMessages(chatMessages)
    }
  }

  const handleSendEdit = async (
    editedContent: string,
    sequenceNumber: number
  ) => {
    if (!selectedChat) return

    handleSendMessage(editedContent, chatMessages, false, false, sequenceNumber)
  }

  const handleDetectPlugin = async (
    payload: ChatPayload,
    selectedPlugin: PluginID
  ): Promise<{ detectedPlugin: PluginID; moderationLevel: number } | null> => {
    const response = await fetch("/api/v2/chat/plugin-detector", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ payload, selectedPlugin })
    })

    if (response.status === 429) {
      const errorData = await response.json()
      if (errorData && errorData.timeRemaining) {
        alertDispatch({
          type: "SHOW",
          payload: {
            message:
              errorData.message ||
              "Rate limit exceeded. Please try again later.",
            title: "Usage Cap Error"
          }
        })
        return null
      }
    }

    if (response.ok) {
      const { plugin: detectedPlugin, moderationLevel } = await response.json()
      return {
        detectedPlugin:
          detectedPlugin && detectedPlugin !== "None"
            ? detectedPlugin
            : selectedPlugin,
        moderationLevel: moderationLevel
      }
    }

    return {
      detectedPlugin: selectedPlugin,
      moderationLevel: -1
    }
  }

  return {
    chatInputRef,
    handleNewChat,
    handleSendMessage,
    handleFocusChatInput,
    handleStopMessage,
    handleSendContinuation,
    handleSendEdit,
    handleSendFeedback,
    handleSelectChat
  }
}
