import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useContext,
  useRef
} from "react"
import { LiveKitRoom } from "@livekit/components-react"
import ActiveRoom from "./active-room"
import { disconnectFromLivekit, fetchLivekitToken } from "./livekit-service"
import {
  IconPlayerPauseFilled,
  IconArrowLeft,
  IconX
} from "@tabler/icons-react"
import { ChatbotUIContext } from "@/context/context"

interface ConversationalAIProps {
  onClose: () => void
}

const ConversationalAI: React.FC<ConversationalAIProps> = ({ onClose }) => {
  const { setIsMicSupported, isMobile } = useContext(ChatbotUIContext)
  const fetchTokenRef = useRef(false)
  const [exiting, setExiting] = useState(false)

  const [state, setState] = useState({
    token: null as string | null,
    url: undefined as string | undefined,
    loading: true,
    error: null as string | null
  })

  const [micPermission, setMicPermission] = useState<PermissionState | null>(
    null
  )
  const [tryToConnect, setTryToConnect] = useState(true)
  const [connected, setConnected] = useState(false)

  const LoadingMessage = () => <Message text="Connecting..." />
  const ErrorMessage = () => <Message text="Connection failed, tap to retry" />
  const WaitingForMicPermissionMessage = () => (
    <Message text="Waiting for microphone permission..." />
  )
  const MicPermissionDeniedMessage = () => (
    <Message text="Microphone permission denied. Please grant permission to use the microphone." />
  )
  const ExitingMessage = () => <Message text="Leaving..." />

  const fetchToken = async () => {
    const { token, url, error } = await fetchLivekitToken()
    setState({ token, url, error, loading: false })
  }

  useEffect(() => {
    if (micPermission === "granted" && !fetchTokenRef.current) {
      fetchTokenRef.current = true
      fetchToken().finally(() => {
        fetchTokenRef.current = false
      })
    }
  }, [micPermission])

  const handleOnClose = useCallback(() => {
    setExiting(true)
    setTryToConnect(false)
    setConnected(false)
    if (state.token && state.url) {
      disconnectFromLivekit().finally(() => {
        onClose()
      })
    } else {
      onClose()
    }
  }, [onClose, state.token, state.url])

  useEffect(() => {
    const requestMicPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true
        })
        stream.getTracks().forEach(track => track.stop())
        setMicPermission("granted")
      } catch (error) {
        setMicPermission("denied")
      }
    }

    requestMicPermission()
  }, [])

  useEffect(() => {
    if (micPermission === "denied") {
      setIsMicSupported(false)
      handleOnClose()
    }
  }, [micPermission, handleOnClose])

  const handleOnError = useCallback((error: Error) => {
    setState(prevState => ({ ...prevState, error: error.message }))
  }, [])

  const handleRetry = useCallback(() => {
    setState(prevState => ({ ...prevState, loading: true, error: null }))
    setTryToConnect(true)
    fetchToken()
  }, [])

  const content = useMemo(() => {
    const { loading, error, token, url } = state
    if (exiting) return <ExitingMessage />
    if (micPermission === "denied") return <MicPermissionDeniedMessage />
    if (micPermission === null) return <WaitingForMicPermissionMessage />
    if (loading) return <LoadingMessage />
    if (error) return <ErrorMessage />
    if (token && url && micPermission === "granted") {
      return (
        <LiveKitRoom
          video={false}
          audio={true}
          token={token}
          serverUrl={url}
          connect={tryToConnect}
          connectOptions={{ autoSubscribe: true }}
          onConnected={() => setConnected(true)}
          onDisconnected={() => {
            setTryToConnect(false)
            setConnected(false)
          }}
          onError={handleOnError}
        >
          <ActiveRoom handleOnClose={handleOnClose} />
        </LiveKitRoom>
      )
    }
    return null
  }, [state, handleOnClose, handleOnError, tryToConnect, micPermission])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#fafafa] dark:bg-[#181818]"
      onClick={state.error ? handleRetry : undefined}
    >
      {state.error && <CenterMessage text={state.error} />}
      {content}
      {(state.error || state.loading || micPermission !== "granted") && (
        <button
          className={`absolute ${isMobile ? "bg-primary text-secondary bottom-10 left-10 rounded-full shadow-lg" : "text-primary right-10 top-5"} p-4 disabled:cursor-not-allowed disabled:opacity-50 md:hover:opacity-50`}
          disabled={true}
        >
          <IconPlayerPauseFilled size={32} />
        </button>
      )}
      <button
        onClick={handleOnClose}
        className={`absolute ${isMobile ? "bg-primary text-secondary bottom-10 right-10 rounded-full shadow-lg" : "text-primary left-10 top-5"} p-4 disabled:cursor-not-allowed disabled:opacity-50 md:hover:opacity-50`}
      >
        {isMobile ? (
          <IconX size={32} strokeWidth={3} />
        ) : (
          <IconArrowLeft size={32} strokeWidth={3} />
        )}
      </button>
    </div>
  )
}

const Message = ({ text }: { text: string }) => (
  <div className="absolute inset-0 top-1/2 flex items-center justify-center p-4">
    {text}
  </div>
)

const CenterMessage = ({ text }: { text: string }) => (
  <div className="absolute inset-0 flex items-center justify-center p-4 px-10 text-center">
    {text.split("\n").map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split("\n").length - 1 && <br />}
      </React.Fragment>
    ))}
  </div>
)

export default ConversationalAI
