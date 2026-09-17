import { useEffect, useState } from 'react'
import { wsManager } from '@/api/client/websocket'

export function useWebSocket<T = unknown>(channel: string, onMessage?: (data: T) => void) {
  const [lastMessage, setLastMessage] = useState<T | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting' | 'error'>('connecting')

  useEffect(() => {
    const handleStatus = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      setConnectionStatus(customEvent.detail as 'connected' | 'disconnected' | 'connecting' | 'error')
    }

    window.addEventListener('hms_ws_status', handleStatus)

    const unsubscribe = wsManager.subscribe(channel, (data) => {
      setLastMessage(data as T)
      if (onMessage) {
        onMessage(data as T)
      }
    })

    return () => {
      unsubscribe()
      window.removeEventListener('hms_ws_status', handleStatus)
    }
  }, [channel, onMessage])

  const sendMessage = (data: unknown) => {
    wsManager.send(channel, data)
  }

  return { lastMessage, connectionStatus, sendMessage }
}
