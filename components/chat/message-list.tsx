"use client";

import { useEffect, useMemo, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageItem } from "./message-item";
import { SenMLMessage } from "@absmach/magistrala-sdk";
import { Badge } from "../ui/badge";

interface MessageListProps {
  messages: SenMLMessage[];
  onReaction?: (messageId: string, emoji: string) => void;
  userId?: string;
  lastReadMessageIndex?: number;
  onMarkAsRead?: (messageIndex: number) => void;
  lastReadAt?: number;
}

function formatDateLabel(date: Date): string {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return date.toLocaleDateString([], {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export function MessageList({
  messages,
  onReaction,
  userId,
  lastReadMessageIndex = -1,
  onMarkAsRead,
  lastReadAt,
}: MessageListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  // const [hasScrolledToBottom, setHasScrolledToBottom] = useState(true)
  // const newMessageIndicatorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const groupedMessages = useMemo(() => {
    const groups: Record<string, SenMLMessage[]> = {};
    messages.forEach((msg) => {
      const timeMs = (msg.time as number) / 1e6;
      const dateKey = new Date(timeMs).toDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(msg);
    });
    return groups;
  }, [messages]);

  // // Scroll to new message indicator when it appears
  // useEffect(() => {
  //   if (newMessageIndicatorRef.current && (lastReadMessageIndex as number) >= 0 && (lastReadMessageIndex as number) < messages.length - 1) {
  //     newMessageIndicatorRef.current.scrollIntoView({
  //       behavior: "smooth",
  //       block: "center",
  //     })
  //   }
  // }, [lastReadMessageIndex, messages.length]);

  // // Handle scroll events to detect if user is at bottom
  // const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
  //   const scrollContainer = event.currentTarget
  //   const isAtBottom = scrollContainer.scrollTop + scrollContainer.clientHeight >= scrollContainer.scrollHeight - 10
  //   setHasScrolledToBottom(isAtBottom)

  //   // Mark messages as read when scrolled into view
  //   if (isAtBottom && onMarkAsRead && messages.length > 0) {
  //     onMarkAsRead(messages.length - 1)
  //   }
  // };

  return (
    <ScrollArea ref={scrollAreaRef} className="max-h-[80vh] flex-1 px-4">
      {/* <div className="space-y-4 py-4">
        {messages.map((message, index) => {
          const previousMessage = messages[index - 1];
          const isMine = message.publisher === userId;
          // const showAvatar =
          //   !previousMessage ||
          //   previousMessage.author.id !== message.author.id ||
          //   message.timestamp.getTime() - previousMessage.timestamp.getTime() > 300000 // 5 minutes

          const messageTime = new Date((message.time as number) / 1000000)

          // Check if we need a date separator
          const prevMessage = index > 0 ? messages[index - 1] : null
          const prevMessageTime = prevMessage
            ? new Date((prevMessage.time as number) / 1000000)
            : null

          const showDateSeparator = !prevMessageTime || isDifferentDay(messageTime, prevMessageTime)

          // Check if this is where new messages begin
          const isNewMessageStart = index === lastReadMessageIndex + 1 && lastReadMessageIndex >= 0

          return (
            <div
              key={`${message.time}-${index}`}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              {showDateSeparator && (
                <div className="flex items-center justify-center my-4">
                  <div className="flex-1 border-t border-border"></div>
                  <div className="px-3 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full">
                    {formatDateSeparator(messageTime)}
                  </div>
                  <div className="flex-1 border-t border-border"></div>
                </div>
              )}
              {isNewMessageStart && (
                <div ref={newMessageIndicatorRef} className="flex items-center justify-center my-4">
                  <div className="flex-1 border-t border-red-500"></div>
                  <div className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-full animate-pulse">
                    New Messages
                  </div>
                  <div className="flex-1 border-t border-red-500"></div>
                </div>
              )}

              <MessageItem
                key={`${message.time}-${index}`}
                message={message}
                showAvatar={false}
                className={` rounded-2xl p-2 shadow-sm ${isMine
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-900"
                  }`}
              />
            </div>
          );
        })}
      </div> */}
      <div className="space-y-4 py-4">
        {Object.entries(groupedMessages).map(([dateKey, msgs]) => {
          const date = new Date(
            (msgs[0].time as number) / 1e6
          );

          return (
            <div key={dateKey}>
              {/* Date divider */}
              <div className="flex items-center my-4">
                <div className="flex-grow border-t border-gray-300"></div>
                <Badge className="text-sm text-gray-500 font-medium rounded-md" variant={"outline"}>
                  {formatDateLabel(date)}
                </Badge>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              {msgs.map((message, index) => {
                const isMine = message.publisher === userId;
                console.log("messageTime", message.time);
                const messageTime = (message.time as number);
                console.log("messageTime", messageTime);
                console.log("lastReadAt", lastReadAt);
                console.log(" messageTime > new Date(lastReadAt)", messageTime > (lastReadAt as number))
                console.log("last logic", (index === 0 || new Date((msgs[index - 1].time as number) / 1e6) <= new Date(lastReadAt as string|number)))
                const showNewDivider =
                  lastReadAt &&
                  messageTime > (lastReadAt as number) &&
                  (index === 0 || new Date((msgs[index - 1].time as number) / 1e6) <= new Date(lastReadAt));

                console.log("shownewdivider", showNewDivider);

                return (
                  <div
                    key={`${message.time}-${index}`}
                  >
                    {showNewDivider && (
                      <div className="flex items-center my-4">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <Badge className="text-sm text-blue-600 font-medium rounded-md" variant={"outline"}>
                          New Messages
                        </Badge>
                        <div className="flex-grow border-t border-gray-300"></div>
                      </div>
                    )}
                    <div
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <MessageItem
                        message={message}
                        showAvatar={false}
                        className={`rounded-2xl p-2 shadow-sm ${isMine
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-900"
                          }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

function formatDateSeparator(date: Date): string {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const yesterdayDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())

  if (messageDate.getTime() === todayDate.getTime()) {
    return "Today"
  } else if (messageDate.getTime() === yesterdayDate.getTime()) {
    return "Yesterday"
  } else {
    return date.toLocaleDateString([], {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }
}

// Helper function to check if two dates are on different days
function isDifferentDay(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() !== date2.getDate() ||
    date1.getMonth() !== date2.getMonth() ||
    date1.getFullYear() !== date2.getFullYear()
  )
}
