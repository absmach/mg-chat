"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, Hash, MessageCircle } from "lucide-react";
import { MessageInput } from "./message-input";
import { MessageList } from "./message-list";
import { Channel, ChannelsPage, UserBasicInfo } from "@absmach/magistrala-sdk";
import {  ListChannelRoles, ViewChannel } from "@/lib/channels";
import { useWebSocket } from "../providers/socket-provider";
import { Session } from "@/types/auth";
import { UserProfile } from "@/lib/users";
import { GetMessages } from "@/lib/messages";
import { ChatMenu } from "./chat-menu";
import { EntityFetchData } from "@/lib/actions";
import { ListChannelRoleMembers } from "@/lib/roles";

interface Props {
  selectedChannel: string | null;
  selectedDM: string | null;
  setSelectedChannel: (channel: string | null) => void;
  session: Session;
  domainId: string;
  initMembers: EntityFetchData;
}

export function ChatView({
  selectedChannel,
  setSelectedChannel,
  selectedDM,
  session,
  domainId,
  initMembers,
}: Props) {
  const { messages, setMessages, sendMessage, connect, disconnect } = useWebSocket();
  const { domain } = session;
  const [isLoading, setIsLoading] = useState(false);
  const [channelInfo, setChannelInfo] = useState<Channel | null>(null);
  const [members, setMembers] = useState<UserBasicInfo[]>([]);
  const [userId, setUserId] = useState("");
  const [chanMessages, setChanMessages] = useState(messages);

  useEffect(() => {
    if (channelInfo?.id) {
      const getMessages = async () => {
        const response = await GetMessages({
          id: channelInfo?.id as string,
          queryParams: {
            offset: 0,
            limit: 100,
            order: "time",
            dir: "asc"
          },
        });

        if (response.data) {
          setMessages(response.data.messages);
        }
      };

      getMessages();
    }
  }, [channelInfo?.id, setMessages]);

  useEffect(() => {
    const connectSocket = async () => {
      const userProfile = await UserProfile();
      if (userProfile.data !== null) {
        setUserId(userProfile.data.id as string);
        connect(
          domain?.id as string,
          selectedChannel as string,
        );
      }
    };
    if (selectedChannel && domain?.id) {
      connectSocket();
    }
    return () => {
      disconnect();
    };
  }, [domain, selectedChannel, disconnect, connect]);

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

  const handleSend = (input: string) => {
    if (input.trim()) {
      sendMessage({
        n: "chat",
        vs: input,
        t: Date.now() * 1e6,
        publisher: userId,
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
        setChanMessages(response.data.messages);
      }
    };
    getMessage();
  }, [channelInfo?.id]);

  useEffect(() => {
    const getMembers = async () => {
      const roleResponse = await ListChannelRoles({
        queryParams: { offset: 0, limit: 10 },
      });

      const memberRole = roleResponse?.data?.roles?.find(
        (role) => role.name === "chat-member"
      );

      const roleId = memberRole?.id as string;
      const response = await ListChannelRoleMembers(
        selectedChannel as string,
        roleId,
        {
        offset: 0,
        limit: 100,
      },
      );
      if (response.data) {
        setMembers(response.data.members);
      }
    };
    getMembers();
  }, [selectedChannel, domainId]);

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

          {channelInfo?.tags?.includes("chat") ? (
            <Hash className="h-5 w-5 text-gray-500" />
          ) : (
            <MessageCircle className="h-5 w-5 text-gray-500" />
          )}

          <div>
            <h2 className="font-semibold text-gray-900">{channelInfo?.name}</h2>
            {channelInfo?.tags?.includes("chat") && (
              <p className="text-xs text-gray-500">{members?.length} {members?.length === 1 ? "member" : "members"}</p>
            )}
          </div>
        </div>
        <ChatMenu channelId={channelInfo?.id as string} chatName={channelInfo?.name as string} domainId={domain?.id as string} initMembers={initMembers} />
      </div>

      <div className="flex-1 flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <MessageList messages={messages} userId={userId as string} />
        )}

        <div className="border p-6 m-4 rounded-md">
          <MessageInput onSendMessage={handleSend} />
        </div>
      </div>
    </div>
  );
}
