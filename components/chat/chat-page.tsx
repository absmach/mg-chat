"use client";

import { Sidebar } from "@/components/chat/sidebar/sidebar";
import { ChatView } from "@/components/chat/chat-view";
import { Session } from "@/types/auth";
import { useState } from "react";

interface Props {
  session: Session;
}
export default function ChatPage({ session }: Props) {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [selectedDM, setSelectedDM] = useState<string | null>(null);

  return (
    <>
      <div
        className={`
            fixed lg:relative inset-y-0 left-0 z-50 w-64 shadow-lg transform transition-transform duration-300 ease-in-out
            
          `}
      >
        <Sidebar
          session={session}
          selectedChannel={selectedChannel}
          selectedDM={selectedDM}
          setSelectedChannel={setSelectedChannel}
          setSelectedDM={setSelectedDM}
        />
      </div>

      <div className="flex-1 flex flex-col">
        <ChatView
          selectedChannel={selectedChannel}
          setSelectedChannel={setSelectedChannel}
          selectedDM={selectedDM}
          session={session}
        />
      </div>
    </>
  );
}
