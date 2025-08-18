"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
  onClose: () => void
}

const EMOJI_CATEGORIES = {
  Smileys: [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "😅",
    "😂",
    "🤣",
    "😊",
    "😇",
    "🙂",
    "🙃",
    "😉",
    "😌",
    "😍",
    "🥰",
    "😘",
    "😗",
    "😙",
    "😚",
    "😋",
    "😛",
    "😝",
    "😜",
    "🤪",
    "🤨",
    "🧐",
    "🤓",
    "😎",
    "🤩",
    "🥳",
  ],
  Gestures: [
    "👍",
    "👎",
    "👌",
    "🤌",
    "🤏",
    "✌️",
    "🤞",
    "🤟",
    "🤘",
    "🤙",
    "👈",
    "👉",
    "👆",
    "🖕",
    "👇",
    "☝️",
    "👏",
    "🙌",
    "👐",
    "🤲",
    "🤝",
    "🙏",
  ],
  Hearts: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝"],
  Objects: ["🎉", "🎊", "🎈", "🎁", "🏆", "🥇", "🥈", "🥉", "⭐", "🌟", "💫", "✨", "🔥", "💯", "💢", "💥", "💨", "💦"],
}

export function EmojiPicker({ onEmojiSelect, onClose }: EmojiPickerProps) {
  return (
    <Card className="w-80 p-4 shadow-lg">
      <div className="space-y-3">
        {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
          <div key={category}>
            <h4 className="text-sm font-medium text-gray-700 mb-2">{category}</h4>
            <div className="grid grid-cols-8 gap-1">
              {emojis.map((emoji) => (
                <Button
                  key={emoji}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                  onClick={() => onEmojiSelect(emoji)}
                >
                  <span className="text-lg">{emoji}</span>
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t">
        <Button variant="outline" size="sm" onClick={onClose} className="w-full bg-transparent">
          Close
        </Button>
      </div>
    </Card>
  )
}
