"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageItem } from "./message-item";
import { SenMLMessage } from "@absmach/magistrala-sdk";

interface MessageListProps {
  messages: SenMLMessage[];
  onReaction?: (messageId: string, emoji: string) => void;
  clientId?: string;
}

export function MessageList({
  messages,
  onReaction,
  clientId,
}: MessageListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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

  return (
    <ScrollArea ref={scrollAreaRef} className="max-h-[80vh] flex-1 px-4">
      <div className="space-y-4 py-4">
        {messages.map((message, index) => {
          const previousMessage = messages[index - 1];
          const isMine = message.publisher === clientId;
          // const showAvatar =
          //   !previousMessage ||
          //   previousMessage.author.id !== message.author.id ||
          //   message.timestamp.getTime() - previousMessage.timestamp.getTime() > 300000 // 5 minutes

          return (
            <div
              key={`${message.time}-${index}`}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
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
      </div>
    </ScrollArea>
  );
}
