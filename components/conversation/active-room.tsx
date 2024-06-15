import { useMultibandTrackVolume } from "@/lib/hooks/useTrackVolume"
import {
  RoomAudioRenderer,
  useConnectionState,
  useIsSpeaking,
  useLocalParticipant,
  useParticipants,
  useRoomInfo,
  useTracks
} from "@livekit/components-react"
import {
  IconMicrophone,
  IconMicrophoneOff,
  IconPlayerPauseFilled,
  IconPlayerPlayFilled
} from "@tabler/icons-react"
import {
  ConnectionState,
  LocalParticipant,
  RemoteTrack,
  Track
} from "livekit-client"
import React, { useCallback, useContext, useEffect, useState } from "react"
import { VisualizerState } from "./agent-multiband-audio-visualizer"
import { AudioVisualizerTile } from "./audio-visualizer-tile"
import { disconnectFromLivekit } from "./livekit-service"
import { ChatbotUIContext } from "@/context/context"

const ActiveRoom: React.FC<{ handleOnClose: () => void }> = ({
  handleOnClose
}) => {
  const { isMobile } = useContext(ChatbotUIContext)

  const { localParticipant } = useLocalParticipant()
  const [isPaused, setIsPaused] = useState(false)
  const [isMicMuted, setIsMicMuted] = useState(false)
  const [visualizerState, setVisualizerState] =
    useState<VisualizerState>("speaking")
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const participants = useParticipants()
  const agentParticipant = participants.find(p => p.isAgent)
  const isAgentConnected = agentParticipant !== undefined
  const isSpeaking = useIsSpeaking(participants[0])

  const roomState = useConnectionState()
  const tracks = useTracks()
  const roomInfo = useRoomInfo()

  useEffect(() => {
    if (roomInfo.name) {
      localStorage.setItem("roomName", roomInfo.name)
    }
  }, [roomInfo.name])

  useEffect(() => {
    const enableMicrophone = async () => {
      await localParticipant?.setMicrophoneEnabled(true)
    }

    if (roomState === ConnectionState.Connected) {
      enableMicrophone()
    }
  }, [localParticipant, roomState])

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      disconnectFromLivekit()
      return "Leaving the room..."
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [])

  const localTracks = tracks.filter(
    ({ participant }) => participant instanceof LocalParticipant
  )

  const agentAudioTrack = tracks.find(
    trackRef =>
      trackRef.publication.kind === Track.Kind.Audio &&
      trackRef.participant.isAgent
  )

  const subscribedVolumes = useMultibandTrackVolume(
    agentAudioTrack?.publication.track
  )

  const localMicTrack = localTracks.find(
    ({ source }) => source === Track.Source.Microphone
  )

  const localMultibandVolume = useMultibandTrackVolume(
    localMicTrack?.publication.track,
    20
  )

  const handlePause = useCallback(() => {
    setIsPaused(prev => !prev)
    if (!isPaused) {
      setIsMicMuted(true)
      localParticipant?.setMicrophoneEnabled(false)
      const agentTrack = agentAudioTrack?.publication.track as RemoteTrack
      agentTrack.stop()
    } else {
      setIsMicMuted(false)
      localParticipant?.setMicrophoneEnabled(true)
      const agentTrack = agentAudioTrack?.publication.track as RemoteTrack
      agentTrack.start()
    }
    // TODO: stop/start the agent audio track
  }, [isPaused, localParticipant, agentAudioTrack])

  const handleMicMute = useCallback(() => {
    setIsMicMuted(prev => !prev)
    localParticipant?.setMicrophoneEnabled(isMicMuted)
  }, [isMicMuted, localParticipant])

  useEffect(() => {
    setVisualizerState(
      loading ? "thinking" : isSpeaking ? "listening" : "speaking"
    )
  }, [loading, isSpeaking])

  useEffect(() => {
    setLoading(tracks.length === 0 || !isAgentConnected || !agentAudioTrack)
  }, [tracks, isAgentConnected, agentAudioTrack])

  const handleScreenClick = useCallback(() => {
    if (isPaused) {
      handlePause()
    }
  }, [isPaused, handlePause])

  useEffect(() => {
    if (isPaused) {
      setMessage("Tap to activate")
      setVisualizerState("idle")
      document.addEventListener("click", handleScreenClick)
    } else {
      setMessage(null)
      setVisualizerState("speaking")
      document.removeEventListener("click", handleScreenClick)
    }

    return () => {
      document.removeEventListener("click", handleScreenClick)
    }
  }, [isPaused, handleScreenClick])

  // Check if the user has been connected for more than 15 minutes
  useEffect(() => {
    const checkConnectionTime = () => {
      const joinedAt = localParticipant?.joinedAt
      if (joinedAt) {
        const now = new Date()
        const diff = now.getTime() - new Date(joinedAt).getTime()
        if (diff > 14 * 60 * 1000) {
          // 14 minutes
          setMessage("The session will end in one minute.")
        }
        if (diff > 15 * 60 * 1000) {
          // 15 minutes
          handleOnClose()
        }
      }
    }

    const connectionTimeInterval = setInterval(checkConnectionTime, 30 * 1000) // Check every 30 seconds
    return () => clearInterval(connectionTimeInterval)
  }, [localParticipant, handleOnClose])

  return (
    <>
      <RoomAudioRenderer />
      <div
        className={`absolute inset-0 ${isMobile ? "bottom-1/4" : ""} flex items-center justify-center`}
      >
        {loading ? (
          <AudioVisualizerTile
            frequencies={localMultibandVolume}
            source={isMobile ? "agent" : "agent-desktop"}
            visualizerState="thinking"
          />
        ) : (
          <AudioVisualizerTile
            frequencies={subscribedVolumes}
            source={
              isPaused
                ? isMobile
                  ? "agent-paused"
                  : "agent-desktop-paused"
                : isMobile
                  ? "agent"
                  : "agent-desktop"
            }
            visualizerState={visualizerState}
          />
        )}
      </div>
      <div className="absolute inset-0 top-1/2 flex items-center justify-center p-4">
        {message ? (
          <div className="p-4">{message}</div>
        ) : (
          loading && <div className="p-4">Loading...</div>
        )}
      </div>
      <button
        onClick={handlePause}
        className={`absolute ${isMobile ? "bg-primary text-secondary bottom-10 left-10 rounded-full shadow-lg" : "text-primary right-10 top-5"} p-4 disabled:cursor-not-allowed disabled:opacity-50 md:hover:opacity-50`}
        disabled={loading}
      >
        {isPaused ? (
          <IconPlayerPlayFilled size={32} />
        ) : (
          <IconPlayerPauseFilled size={32} />
        )}
      </button>
      {!isPaused && localMicTrack && !loading && (
        <button
          onClick={handleMicMute}
          className={`text-primary ${isMicMuted ? "opacity-50 md:hover:opacity-100" : "opacity-100 md:hover:opacity-50"} absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center p-4`}
        >
          <div className="flex flex-row items-center gap-1">
            {isMicMuted ? (
              <IconMicrophoneOff size={20} />
            ) : (
              <IconMicrophone size={20} />
            )}
            <AudioVisualizerTile
              frequencies={localMultibandVolume}
              source="user"
            />
          </div>
        </button>
      )}
    </>
  )
}

export default ActiveRoom
