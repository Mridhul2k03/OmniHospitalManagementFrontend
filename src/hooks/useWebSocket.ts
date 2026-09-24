import { useEffect, useState, useRef, useCallback } from 'react'
import { wsManager } from '@/api/client/websocket'

export interface WebSocketEvent<T = any> {
  type: 'KOT_ORDER_FIRED' | 'KOT_STATUS_CHANGED' | 'ROOM_STATUS_CHANGED' | 'GUEST_CHECKED_IN' | string
  data: T
}

export function useHotelWebSocket(propertyId: string = 'prop-001') {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<WebSocketEvent | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  const connect = useCallback(() => {
    const baseWs = import.meta.env.VITE_WS_GATEWAY_URL || `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/`
    const wsUrl = baseWs.includes('?') ? `${baseWs}&property_id=${propertyId}` : `${baseWs}?property_id=${propertyId}`
    try {
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('✅ WebSocket connected to HMOS Gateway')
        setIsConnected(true)
      }

      ws.onmessage = (event) => {
        try {
          const payload: WebSocketEvent = JSON.parse(event.data)
          setLastMessage(payload)
        } catch (err) {
          console.error('Failed to parse WS frame:', err)
        }
      }

      ws.onclose = () => {
        setIsConnected(false)
        // Auto-reconnect after 3 seconds
        setTimeout(connect, 3000)
      }

      ws.onerror = (err) => {
        console.warn('WebSocket Error:', err)
        try {
          ws.close()
        } catch {}
      }
    } catch (e) {
      console.warn('WebSocket initialization fallback:', e)
      setTimeout(connect, 5000)
    }
  }, [propertyId])

  useEffect(() => {
    connect()
    return () => {
      if (wsRef.current) {
        try {
          wsRef.current.close()
        } catch {}
      }
    }
  }, [connect])

  return { isConnected, lastMessage }
}

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
