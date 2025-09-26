"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageItem } from "./message-item";
import { SenMLMessage } from "@absmach/magistrala-sdk";

interface MessageListProps {
  messages: SenMLMessage[];
  userId?: string;
}

export function MessageList({
  messages,
  userId,
}: MessageListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
          const isMine = message.publisher === userId;

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
