import { useEffect, useRef } from 'react'

export function useKeyboardShortcut(key: string, callback: (event: KeyboardEvent) => void, enabled = true) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === key) {
        event.preventDefault()
        callbackRef.current(event)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [key, enabled])
}
