import { FC } from "react"

interface LimitDisplayProps {
  used: number
  limit: number
  isOverLimit?: boolean
}

export const LimitDisplay: FC<LimitDisplayProps> = ({
  used,
  limit,
  isOverLimit = false
}) => {
  return (
    <div className={`text-xs italic ${isOverLimit ? "text-red-500" : ""}`}>
      {used}/{limit}
    </div>
  )
}
