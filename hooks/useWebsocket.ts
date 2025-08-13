'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

export interface WebSocketMessage {
  id?: string
  content: string
  sender: string
  timestamp: number
  channel: string
  type?: 'message' | 'join' | 'leave' | 'typing'
}

interface UseWebSocketProps {
  domainId: string
  topic: string
  authorization: string
  onMessage?: (message: WebSocketMessage) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Event) => void
}

interface UseWebSocketReturn {
  isConnected: boolean
  sendMessage: (content: string, sender: string) => void
  disconnect: () => void
  reconnect: () => void
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
}

export function useWebSocket({
  domainId,
  topic,
  authorization,
  onMessage,
  onConnect,
  onDisconnect,
  onError
}: UseWebSocketProps): UseWebSocketReturn {
  const wsRef = useRef<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    try {
      setConnectionStatus('connecting')
      const wsUrl = `ws://localhost:8186/m/${domainId}/c/${channelId}/?authorization=${clientSecret}`
      
      console.log('Connecting to WebSocket:', wsUrl)
      
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('WebSocket connected')
        setIsConnected(true)
        setConnectionStatus('connected')
        reconnectAttemptsRef.current = 0
        onConnect?.()

        const initPayload = [
    {
      n: 'temp',
      bt: Date.now() * 1_000_000, // nanoseconds
      vs: 'hello'
    }
  ]

  try {
    const serializedPayload = JSON.stringify(initPayload)
    ws.send(serializedPayload)
    console.log('Sent initial WS payload:', serializedPayload)
  } catch (e) {
    console.error('Failed to send initial payload:', e)
  }
      }

      ws.onmessage = (event) => {
        try {
          console.log('Raw WebSocket message:', event.data)
          
          // Try to parse as JSON first
          let messageData: WebSocketMessage
          
          try {
            const parsed = JSON.parse(event.data)
            messageData = {
              id: parsed.id || Date.now().toString(),
              content: parsed.content || parsed.message || event.data,
              sender: parsed.sender || parsed.from || 'Unknown',
              timestamp: parsed.timestamp || Date.now(),
              channel: topic,
              type: parsed.type || 'message'
            }
          } catch {
            // If not JSON, treat as plain text message
            messageData = {
              id: Date.now().toString(),
              content: event.data,
              sender: 'System',
              timestamp: Date.now(),
              channel: topic,
              type: 'message'
            }
          }

          console.log('Processed message:', messageData)
          onMessage?.(messageData)
        } catch (error) {
          console.error('Error processing WebSocket message:', error)
        }
      }

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason)
        setIsConnected(false)
        setConnectionStatus('disconnected')
        onDisconnect?.()

        // Attempt to reconnect if not a manual close
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000)
          console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++
            connect()
          }, delay)
        }
      }

      ws.onerror = (error) => {
        console.log("websocket err", error)
        console.error('WebSocket error:', error)
        setConnectionStatus('error')
        onError?.(error)
      }

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      setConnectionStatus('error')
    }
  }, [topic, onMessage, onConnect, onDisconnect, onError])

  const sendMessage = useCallback((content: string, sender: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message = {
        content,
        sender,
        timestamp: Date.now(),
        channel: topic,
        type: 'message'
      }
      
      console.log('Sending message:', message)
      wsRef.current.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket is not connected. Message not sent:', content)
    }
  }, [topic])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect')
      wsRef.current = null
    }
    
    setIsConnected(false)
    setConnectionStatus('disconnected')
  }, [])

  const reconnect = useCallback(() => {
    disconnect()
    setTimeout(() => {
      reconnectAttemptsRef.current = 0
      connect()
    }, 100)
  }, [disconnect, connect])

  useEffect(() => {
    if (domainId && topic && authorization) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [domainId, topic, authorization, connect, disconnect])

  return {
    isConnected,
    sendMessage,
    disconnect,
    reconnect,
    connectionStatus
  }
}
