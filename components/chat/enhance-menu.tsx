import React, { useContext } from "react"
import { PentestGPTContext } from "@/context/context"
import PluginSelector from "./plugin-selector"

export const EnhancedMenuPicker: React.FC = () => {
  const { setSelectedPluginType } = useContext(PentestGPTContext)

  const handleSelectPlugin = (type: string) => {
    setSelectedPluginType(type)
  }

  return (
    <div className="bg-secondary flex min-h-[56px] flex-col space-y-1 rounded-xl px-4 py-2 text-sm">
      <PluginSelector onPluginSelect={handleSelectPlugin} />
    </div>
  )
}
