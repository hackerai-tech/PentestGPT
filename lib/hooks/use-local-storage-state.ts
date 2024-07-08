import { useCallback, useEffect, useState } from "react"

export function useLocalStorageState<T>(key: string, defaultValue: T) {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") {
      return defaultValue
    }
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return defaultValue
    }
  })

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(state))
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, state])

  const setValue = useCallback((value: T | ((prevState: T) => T)) => {
    setState(prevState => {
      const nextState =
        typeof value === "function"
          ? (value as (prevState: T) => T)(prevState)
          : value
      return nextState
    })
  }, [])

  return [state, setValue] as const
}
