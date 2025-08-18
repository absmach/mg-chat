"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, Hash, MessageCircle, MoreVertical } from "lucide-react";
import { MessageInput } from "./message-input";
import { MessageList } from "./message-list";
import { Channel, ChannelsPage } from "@absmach/magistrala-sdk";
import { ListChannelMembers, ViewChannel } from "@/lib/channels";
import { Member } from "@/types/entities";
import { useWebSocket } from "../providers/socket-provider";
import { Session } from "@/types/auth";
import { UserProfile } from "@/lib/users";
import { GetMessages } from "@/lib/messages";

interface Props {
  selectedChannel: string | null;
  selectedDM: string | null;
  setSelectedChannel: (channel: string | null) => void;
  session: Session;
}

export function ChatView({
  selectedChannel,
  setSelectedChannel,
  selectedDM,
  session,
}: Props) {
  const { messages, sendMessage, connect } = useWebSocket();
  const { domain } = session;
  const [isLoading, setIsLoading] = useState(false);
  const [channelInfo, setChannelInfo] = useState<Channel | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [membersTotal, setMembersTotal] = useState(0);
  const [chanMessages, setChanMessages] = useState(messages);

  useEffect(() => {
    const connectSocket = async () => {
      const userProfile = await UserProfile();
      if (userProfile.data !== null) {
        connect(
          domain?.id as string,
          selectedChannel as string,
          userProfile.data?.metadata?.ui.client.secret
        );
      }
    };
    if (selectedChannel && domain?.id) {
      connectSocket();
    }
  }, [domain, selectedChannel, connect]);

  useEffect(() => {
    const getData = async () => {
      const response = await ViewChannel(selectedChannel || "");
      if (response.data) {
        if (!selectedChannel) {
          const chan = (response.data as ChannelsPage).channels?.[0];
          setSelectedChannel(chan?.id as string);
          setChannelInfo(chan);
        } else {
          setChannelInfo(response.data);
        }
      } else {
        setChannelInfo(null);
      }
    };

    getData();
  }, [selectedChannel, setSelectedChannel]);

  useEffect(() => {
    const getData = async () => {
      const response = await ListChannelMembers({
        queryParams: { offset: 0, limit: 100 },
        id: channelInfo?.id,
      });
      if (response.data) {
        setMembers(response.data.members);
        setMembersTotal(response.data.total);
      } else {
        setMembers([]);
        setMembersTotal(0);
      }
    };

    getData();
  }, [channelInfo?.id]);

  const handleSend = (input: string) => {
    if (input.trim()) {
      sendMessage({
        n: "chat",
        vs: input,
        t: Date.now() / 1000,
      });
    }
  };

  useEffect(() => {
    const getMessage = async () => {
      const response = await GetMessages({
        id: channelInfo?.id as string,
        queryParams: { offset: 0, limit: 100, protocol: "websocket" }
      });
      if (response.data) {
        console.log("messages", response.data.messages);
        setChanMessages(response.data.messages);
      }
    };
    getMessage();
  }, [channelInfo?.id]);


  if (!selectedChannel && !selectedDM) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Welcome to SuperMQ Chat
          </h3>
          <p className="text-gray-500">
            Create a channel or start a direct message to begin chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>

          {channelInfo?.tags?.includes("group") ? (
            <Hash className="h-5 w-5 text-gray-500" />
          ) : (
            <MessageCircle className="h-5 w-5 text-gray-500" />
          )}

          <div>
            <h2 className="font-semibold text-gray-900">{channelInfo?.name}</h2>
            {channelInfo?.tags?.includes("group") && (
              <p className="text-xs text-gray-500">{membersTotal} members</p>
            )}
          </div>
        </div>

        <Button variant="ghost" size="sm">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <MessageList messages={chanMessages} />
        )}

        <div className="border-t p-4">
          <MessageInput onSendMessage={handleSend} />
        </div>
      </div>
    </div>
  );
}
