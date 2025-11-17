"use client"

import { SenMLMessage } from "@absmach/magistrala-sdk"
import { useEffect, useState, useCallback } from "react"

interface UseMessageNotificationsProps {
  messages: SenMLMessage[]
  userId: string
  isWindowFocused?: boolean
}

export function useMessageNotifications({ messages, userId, isWindowFocused = true }: UseMessageNotificationsProps) {
  const [lastReadMessageIndex, setLastReadMessageIndex] = useState<number>(-1)
  const [unreadCount, setUnreadCount] = useState(0)

  // Initialize last read message index when messages first load
  useEffect(() => {
    if (messages.length > 0 && lastReadMessageIndex === -1) {
      setLastReadMessageIndex(messages.length - 1)
    }
  }, [messages, lastReadMessageIndex])

  const showNotification = useCallback((message: SenMLMessage) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("New Message", {
        body: (message.string_value as string)?.substring(0, 100) + ((message.string_value as string)?.length > 100 ? "..." : ""),
        icon: "/favicon.ico",
        tag: "chat-message",
      })
    }
  }, [])

  // Update unread count when new messages arrive
  useEffect(() => {
    const newUnreadCount = Math.max(0, messages.length - 1 - lastReadMessageIndex)
    setUnreadCount(newUnreadCount)

    // Show browser notification for new messages (not from current user)
    if (newUnreadCount > 0 && !isWindowFocused) {
      const latestMessage = messages[messages.length - 1]
      if (latestMessage && latestMessage.publisher !== userId) {
        showNotification(latestMessage)
      }
    }
  }, [messages.length, lastReadMessageIndex, userId, isWindowFocused, messages, showNotification])

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  const markAsRead = useCallback(
    (messageIndex: number) => {
      setLastReadMessageIndex(Math.max(lastReadMessageIndex, messageIndex))
    },
    [lastReadMessageIndex],
  )

  const markAllAsRead = useCallback(() => {
    setLastReadMessageIndex(messages.length - 1)
  }, [messages.length])

  return {
    lastReadMessageIndex,
    unreadCount,
    markAsRead,
    markAllAsRead,
  }
}
