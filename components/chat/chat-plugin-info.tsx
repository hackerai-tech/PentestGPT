import { PluginSummary } from "@/types/plugins"
import React from "react"

interface ChatPluginInfoProps {
  pluginInfo: PluginSummary | undefined
}

export const ChatPluginInfo: React.FC<ChatPluginInfoProps> = ({
  pluginInfo
}) => {
  if (!pluginInfo) return null

  return (
    <div className="text-center">
      <img
        src={pluginInfo.icon}
        alt={pluginInfo.name}
        className={`mx-auto size-12 ${
          pluginInfo.invertInDarkMode
            ? "dark:brightness-0 dark:invert"
            : "rounded-full"
        }`}
      />
      <h2 className="mt-3 text-2xl font-semibold">{pluginInfo.name}</h2>
      <p className="mt-1 text-sm">{pluginInfo.description}</p>
    </div>
  )
}
