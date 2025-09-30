"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Smile } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageItemProps {
  message: any;
  showAvatar: boolean;
  className?: string;
}

export function MessageItem({
  message,
  showAvatar,
  className,
}: MessageItemProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  return (
    <div
      className={cn(
        "group flex space-x-3  px-2 py-1 border rounded-md",
        className
      )}
    >
      <div className="flex-shrink-0">
        {showAvatar ? (
          <Avatar className="h-8 w-8">
            <AvatarFallback>{message.publisher.charAt(0)}</AvatarFallback>
          </Avatar>
        ) : (
          <div className="w-8 h-8 flex items-center justify-center">
              <span className="text-xs ">
                {new Date(
                  (message.t || (message.time as number)) / 1000000
                ).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-gray-900 break-words">
          {message.vs || message.string_value}
        </div>
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 mt-1"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile className="h-4 w-4" />
          </Button>

          {/* {showEmojiPicker && (
            <div className="absolute top-8 left-0 z-50">
              <EmojiPicker
                onEmojiSelect={(emoji) => {
                  onReaction(message.id, emoji)
                  setShowEmojiPicker(false)
                }}
                onClose={() => setShowEmojiPicker(false)}
              />
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
}
