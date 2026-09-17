import { ENV } from '@/app/config/env'

type MessageCallback = (data: unknown) => void

class WebSocketManager {
  private socket: WebSocket | null = null
  private subscribers: Map<string, Set<MessageCallback>> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectInterval = 3000
  private isConnecting = false

  public connect(token?: string) {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return
    }

    this.isConnecting = true
    const wsUrl = token ? `${ENV.WS_BASE_URL}?token=${token}` : ENV.WS_BASE_URL

    try {
      this.socket = new WebSocket(wsUrl)

      this.socket.onopen = () => {
        this.isConnecting = false
        this.reconnectAttempts = 0
        window.dispatchEvent(new CustomEvent('hms_ws_status', { detail: 'connected' }))
      }

      this.socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data)
          const channel = parsed.channel || 'global'
          const callbacks = this.subscribers.get(channel)
          if (callbacks) {
            callbacks.forEach((cb) => cb(parsed.payload || parsed))
          }
        } catch {
          // Ignore parse errors for keepalive pings
        }
      }

      this.socket.onerror = () => {
        window.dispatchEvent(new CustomEvent('hms_ws_status', { detail: 'error' }))
      }

      this.socket.onclose = () => {
        this.isConnecting = false
        window.dispatchEvent(new CustomEvent('hms_ws_status', { detail: 'disconnected' }))
        this.scheduleReconnect()
      }
    } catch {
      this.isConnecting = false
      this.scheduleReconnect()
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => this.connect(), this.reconnectInterval * this.reconnectAttempts)
    }
  }

  public subscribe(channel: string, callback: MessageCallback) {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set())
    }
    this.subscribers.get(channel)!.add(callback)

    return () => {
      const callbacks = this.subscribers.get(channel)
      if (callbacks) {
        callbacks.delete(callback)
        if (callbacks.size === 0) {
          this.subscribers.delete(channel)
        }
      }
    }
  }

  public send(channel: string, data: unknown) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ channel, data }))
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
  }
}

export const wsManager = new WebSocketManager()
