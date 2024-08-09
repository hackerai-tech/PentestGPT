import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
import { PentestGPTContext } from "@/context/context"
import { LLM_LIST } from "@/lib/models/llm/llm-list"
import { cn } from "@/lib/utils"
import { Tables } from "@/supabase/types"
import { LLM, LLMID, MessageImage } from "@/types"
import {
  IconPuzzle,
  IconWorld,
  IconCaretDownFilled,
  IconCaretRightFilled,
  IconCircleFilled,
  IconFileFilled,
  IconFileText,
  IconFileTypePdf,
  IconDatabaseSearch,
  IconCode
} from "@tabler/icons-react"
import Image from "next/image"
import { FC, useContext, useEffect, useRef, useState } from "react"
import { ModelIcon } from "../models/model-icon"
import { Button } from "../ui/button"
import { FilePreview } from "../ui/file-preview"
import { TextareaAutosize } from "../ui/textarea-autosize"
import { MessageActions } from "./message-actions"
import MessageDetailedFeedback from "./message-detailed-feedback"
import { MessageQuickFeedback } from "./message-quick-feedback"
import { MessageTypeResolver } from "./message-type-solver"
import { PluginID } from "@/types/plugins"

const ICON_SIZE = 28

interface MessageProps {
  message: Tables<"messages">
  previousMessage: Tables<"messages"> | undefined
  fileItems: Tables<"file_items">[]
  feedback?: Tables<"feedback">
  isEditing: boolean
  isLast: boolean
  onStartEdit: (message: Tables<"messages">) => void
  onCancelEdit: () => void
  onSubmitEdit: (value: string, sequenceNumber: number) => void
  onSendFeedback: (
    feedback: "good" | "bad",
    reason?: string,
    detailedFeedback?: string,
    allowSharing?: boolean,
    allowEmail?: boolean
  ) => void
}

export const Message: FC<MessageProps> = ({
  message,
  previousMessage,
  fileItems,
  feedback,
  isEditing,
  isLast,
  onStartEdit,
  onCancelEdit,
  onSubmitEdit,
  onSendFeedback
}) => {
  const {
    isGenerating,
    setIsGenerating,
    firstTokenReceived,
    chatMessages,
    chatImages,
    toolInUse,
    files,
    isMobile,
    showSidebar
  } = useContext(PentestGPTContext)

  const { handleSendMessage } = useChatHandler()

  const messageSizeLimit = Number(
    process.env.NEXT_PUBLIC_MESSAGE_SIZE_LIMIT || 12000
  )

  const editInputRef = useRef<HTMLTextAreaElement>(null)

  const [isHovering, setIsHovering] = useState(false)
  const [editedMessage, setEditedMessage] = useState(message.content)

  const [showImagePreview, setShowImagePreview] = useState(false)
  const [selectedImage, setSelectedImage] = useState<MessageImage | null>(null)

  const [showFileItemPreview, setShowFileItemPreview] = useState(false)
  const [selectedFileItem, setSelectedFileItem] =
    useState<Tables<"file_items"> | null>(null)

  const [viewSources, setViewSources] = useState(false)

  const [quickFeedback, setQuickFeedback] = useState(false)
  const [sendReportQuery, setSendReportQuery] = useState(false)

  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false)

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(message.content)
    } else {
      const textArea = document.createElement("textarea")
      textArea.value = message.content
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
    }
  }

  const handleSendEdit = () => {
    onSubmitEdit(editedMessage, message.sequence_number)
    onCancelEdit()
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (isEditing && event.key === "Enter" && event.metaKey) {
      handleSendEdit()
    }
  }

  const handleRegenerate = async () => {
    setIsGenerating(true)
    await handleSendMessage(
      editedMessage || chatMessages[chatMessages.length - 2].message.content,
      chatMessages,
      true
    )
  }

  const handleRegenerateSpecificModel = async (model: string) => {
    setIsGenerating(true)

    await handleSendMessage(
      editedMessage || chatMessages[chatMessages.length - 2].message.content,
      chatMessages,
      true,
      false,
      undefined,
      model as LLMID
    )
  }

  const handleGoodResponse = async () => {
    if (feedback?.feedback !== "good") {
      onSendFeedback("good", "", "", false, false)
    }
  }

  const handleReportModal = async () => {
    setSendReportQuery(false)
    setIsFeedbackDialogOpen(true)
  }

  const handleBadResponseReason = async (reason: string) => {
    if (feedback?.feedback !== "bad" || feedback?.reason !== reason) {
      onSendFeedback("bad", reason, "", false, false)
    }
    setQuickFeedback(false)
    setSendReportQuery(true)
  }

  const handleBadResponse = async () => {
    if (feedback?.feedback !== "bad") {
      onSendFeedback("bad", "", "", false, false)
    }
    setQuickFeedback(true)
  }

  useEffect(() => {
    if (quickFeedback) {
      const feedbackElement = document.querySelector(".quick-feedback")
      if (feedbackElement) {
        feedbackElement.scrollIntoView({ behavior: "smooth", block: "nearest" })
      }
    }
  }, [quickFeedback])

  const handleStartEdit = () => {
    onStartEdit(message)
  }

  useEffect(() => {
    setEditedMessage(message.content)

    if (isEditing && editInputRef.current) {
      const input = editInputRef.current
      input.focus()
      input.setSelectionRange(input.value.length, input.value.length)
    }
  }, [isEditing])

  const MODEL_DATA = [...LLM_LIST].find(
    llm => llm.modelId === message.model
  ) as LLM

  const modelDetails = LLM_LIST.find(model => model.modelId === message.model)

  return (
    <div
      className={cn("flex w-full justify-center")}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onKeyDown={handleKeyDown}
    >
      <div
        className={`relative flex w-full flex-col px-8 py-6 sm:w-[550px] sm:px-0 md:w-[650px] xl:w-[800px] 
        ${showSidebar ? "lg:w-[650px]" : "lg:w-[700px]"}
        ${isLast ? "mb-8" : ""}`}
      >
        <div className="flex space-x-3">
          {message.role === "assistant" && !isMobile && (
            <div className="shrink-0">
              <ModelIcon
                modelId={modelDetails?.modelId || "custom"}
                height={ICON_SIZE}
                width={ICON_SIZE}
              />
            </div>
          )}
          <div
            className={`grow ${isMobile && "space-y-3"} min-w-0 ${message.role === "user" ? "flex justify-end" : ""}`}
          >
            <div className="flex items-center">
              {message.role === "assistant" && isMobile && (
                <ModelIcon
                  modelId={modelDetails?.modelId || "custom"}
                  height={ICON_SIZE}
                  width={ICON_SIZE}
                />
              )}
              {isMobile && (
                <div className="ml-2 font-semibold">
                  {message.role === "assistant" && MODEL_DATA?.shortModelName}
                </div>
              )}
            </div>

            {!firstTokenReceived &&
            isGenerating &&
            isLast &&
            message.role === "assistant" ? (
              <>
                {(() => {
                  switch (toolInUse) {
                    case "none":
                      return (
                        <IconCircleFilled className="animate-pulse" size={20} />
                      )
                    case "retrieval":
                      return (
                        <div className="flex animate-pulse items-center space-x-2">
                          <IconFileText size={20} />

                          <div>Searching files...</div>
                        </div>
                      )
                    case PluginID.WEB_SEARCH:
                      return (
                        <div className="flex animate-pulse items-center space-x-2">
                          <IconWorld size={20} />

                          <div>Searching the web...</div>
                        </div>
                      )
                    case "Enhanced Search":
                      return (
                        <div className="flex animate-pulse items-center space-x-2">
                          <IconDatabaseSearch size={20} />

                          <div>Using Enhanced Search...</div>
                        </div>
                      )
                    case PluginID.CODE_INTERPRETER:
                      return (
                        <div className="flex animate-pulse items-center space-x-2">
                          <IconCode size={20} />

                          <div>Using Code Interpreter...</div>
                        </div>
                      )
                    default:
                      return (
                        <div className="flex animate-pulse items-center space-x-2">
                          <IconPuzzle size={20} />

                          <div>Using {toolInUse}...</div>
                        </div>
                      )
                  }
                })()}
              </>
            ) : isEditing ? (
              <TextareaAutosize
                textareaRef={editInputRef}
                className="text-md"
                value={editedMessage}
                onValueChange={setEditedMessage}
                maxRows={isMobile ? 6 : 12}
              />
            ) : (
              <div>
                <div className={`flex flex-wrap justify-end gap-2`}>
                  {message.image_paths.map((path, index) => {
                    const item = chatImages.find(image => image.path === path)

                    return (
                      <Image
                        key={index}
                        className="mb-2 cursor-pointer rounded hover:opacity-50"
                        src={path.startsWith("data") ? path : item?.base64}
                        alt="message image"
                        width={300}
                        height={300}
                        onClick={() => {
                          setSelectedImage({
                            messageId: message.id,
                            path,
                            base64: path.startsWith("data")
                              ? path
                              : item?.base64 || "",
                            url: path.startsWith("data") ? "" : item?.url || "",
                            file: null
                          })

                          setShowImagePreview(true)
                        }}
                        loading="lazy"
                      />
                    )
                  })}
                </div>
                <MessageTypeResolver
                  previousMessage={previousMessage}
                  message={message}
                  messageSizeLimit={messageSizeLimit}
                  isLastMessage={isLast}
                  toolInUse={toolInUse}
                />
              </div>
            )}
          </div>
        </div>

        {fileItems.length > 0 && (
          <div className="my-6 text-lg font-bold">
            {!viewSources ? (
              <div
                className="flex cursor-pointer items-center hover:opacity-50"
                onClick={() => setViewSources(true)}
              >
                View {fileItems.length} Sources{" "}
                <IconCaretRightFilled className="ml-1" />
              </div>
            ) : (
              <>
                <div
                  className="flex cursor-pointer items-center hover:opacity-50"
                  onClick={() => setViewSources(false)}
                >
                  Sources <IconCaretDownFilled className="ml-1" />
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2">
                  {fileItems.map((fileItem, index) => {
                    const parentFile = files.find(
                      file => file.id === fileItem.file_id
                    )

                    return (
                      <div
                        key={index}
                        className="border-primary flex cursor-pointer items-center space-x-4 rounded-xl border px-4 py-3 hover:opacity-50"
                        onClick={() => {
                          setSelectedFileItem(fileItem)
                          setShowFileItemPreview(true)
                        }}
                      >
                        <div className="rounded bg-blue-500 p-2">
                          {(() => {
                            let fileExtension = parentFile?.type.includes("/")
                              ? parentFile.type.split("/")[1]
                              : parentFile?.type

                            switch (fileExtension) {
                              case "pdf":
                                return <IconFileTypePdf />
                              default:
                                return <IconFileFilled />
                            }
                          })()}
                        </div>

                        <div className="w-fit space-y-1 truncate text-wrap text-xs">
                          <div className="truncate">{parentFile?.name}</div>

                          <div className="truncate text-xs opacity-50">
                            {fileItem.content.substring(0, 60)}...
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-2"></div>

        {isEditing && (
          <div className="mt-4 flex justify-center space-x-2">
            <Button size="sm" variant="outline" onClick={onCancelEdit}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSendEdit}>
              Send
            </Button>
          </div>
        )}

        {!quickFeedback && !sendReportQuery && !isEditing && (
          <div
            className={`absolute bottom-1 ${message.role === "user" ? "right-10 sm:right-0" : "left-5 sm:left-10"}`}
          >
            <MessageActions
              onCopy={handleCopy}
              onEdit={handleStartEdit}
              isAssistant={message.role === "assistant"}
              isLast={isLast}
              isEditing={isEditing}
              isHovering={isHovering}
              isGoodResponse={feedback?.feedback === "good"}
              isBadResponse={feedback?.feedback === "bad"}
              messageHasImage={message.image_paths.length > 0}
              onRegenerate={handleRegenerate}
              onRegenerateSpecificModel={handleRegenerateSpecificModel}
              onGoodResponse={handleGoodResponse}
              onBadResponse={handleBadResponse}
              messageContent={message.content}
              messageModel={message.model}
              messageSequenceNumber={message.sequence_number}
            />
          </div>
        )}

        {quickFeedback && (
          <MessageQuickFeedback
            handleBadResponseReason={handleBadResponseReason}
            feedback={feedback}
          />
        )}

        {sendReportQuery && (
          <div className="rounded-lg border p-4 shadow-lg">
            <p className="mb-2">Would you like to tell us more details?</p>
            <div className="flex flex-row flex-wrap items-start gap-2">
              <Button variant="outline" size="sm" onClick={handleReportModal}>
                Yes
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSendReportQuery(false)}
              >
                No
              </Button>
            </div>
          </div>
        )}
      </div>

      {showImagePreview && selectedImage && (
        <FilePreview
          type="image"
          item={selectedImage}
          isOpen={showImagePreview}
          onOpenChange={(isOpen: boolean) => {
            setShowImagePreview(isOpen)
            setSelectedImage(null)
          }}
        />
      )}

      {showFileItemPreview && selectedFileItem && (
        <FilePreview
          type="file_item"
          item={selectedFileItem}
          isOpen={showFileItemPreview}
          onOpenChange={(isOpen: boolean) => {
            setShowFileItemPreview(isOpen)
            setSelectedFileItem(null)
          }}
        />
      )}

      <MessageDetailedFeedback
        isOpen={isFeedbackDialogOpen}
        onClose={() => setIsFeedbackDialogOpen(false)}
        feedback={feedback as Tables<"feedback">}
        onSendFeedback={onSendFeedback}
      />
    </div>
  )
}
