"use client";

import { Sidebar } from "@/components/chat/sidebar/sidebar";
import { ChatView } from "@/components/chat/chat-view";
import { Session } from "@/types/auth";
import { useState } from "react";
import { Member, Metadata } from "@/types/entities";

interface Props {
  session: Session;
  metadata: Metadata;
  members: Member[];
}
export default function ChatPage({ session, metadata, members }: Props) {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [selectedDM, setSelectedDM] = useState<string | null>(null);
  const domainId = session.domain?.id;

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
          metadata={metadata}
          members={members}
        />
      </div>

      <div className="flex-1 flex flex-col">
        <ChatView
          selectedChannel={selectedChannel}
          setSelectedChannel={setSelectedChannel}
          selectedDM={selectedDM}
          session={session}
          domainId={domainId as string}
        />
      </div>
    </>
  );
}
