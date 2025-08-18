"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Smile, Download, FileText, ImageIcon } from "lucide-react";
import { EmojiPicker } from "./emoji-picker";
import { SenMLMessage } from "@absmach/magistrala-sdk";

interface MessageItemProps {
  message: any;
  showAvatar: boolean;
  onReaction?: (messageId: string, emoji: string) => void;
}

export function MessageItem({
  message,
  showAvatar,
  onReaction,
}: MessageItemProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  return (
    <div className="group flex space-x-3 hover:bg-gray-50 px-2 py-1 rounded">
      <div className="flex-shrink-0">
        {showAvatar ? (
          <Avatar className="h-8 w-8">
            {/* <AvatarImage src={message.author.avatar || "/placeholder.svg"} /> */}
            {/* <AvatarFallback>{message.publisher.charAt(0)}</AvatarFallback> */}
          </Avatar>
        ) : (
          <div className="w-8 h-8 flex items-center justify-center">
            <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100">
              {new Date((message.t as number) / 1000000).toLocaleTimeString(
                [],
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        {/* {showAvatar && (
          <div className="flex items-baseline space-x-2 mb-1">
            <span className="font-medium text-gray-900">{message.author.name}</span>
            <span className="text-xs text-gray-500">{formatDistanceToNow(message.timestamp, { addSuffix: true })}</span>
          </div>
        )} */}

        <div className="text-gray-900 break-words">{message.vs}</div>

        {/* Attachments */}
        {/* {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.attachments.map((attachment) => (
              <div key={attachment.id} className="flex items-center space-x-2 p-2 bg-gray-100 rounded border">
                {getFileIcon(attachment.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{attachment.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )} */}

        {/* Reactions */}
        {/* {message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {message.reactions.map((reaction) => (
              <Button
                key={reaction.emoji}
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs bg-transparent"
                onClick={() => onReaction(message.id, reaction.emoji)}
              >
                <span className="mr-1">{reaction.emoji}</span>
                <span>{reaction.count}</span>
              </Button>
            ))}
          </div>
        )} */}

        {/* Reaction button */}
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