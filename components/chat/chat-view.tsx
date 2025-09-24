"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, Hash, MessageCircle, EllipsisVertical } from "lucide-react";
import { MessageInput } from "./message-input";
import { MessageList } from "./message-list";
import { Channel, ChannelsPage, Client, User } from "@absmach/magistrala-sdk";
import { ListChannelMembers, ViewChannel } from "@/lib/channels";
import { useWebSocket } from "../providers/socket-provider";
import { Session } from "@/types/auth";
import { UserProfile, ViewUser } from "@/lib/users";
import { GetMessages } from "@/lib/messages";

interface Props {
  selectedChannel: string | null;
  selectedDM: string | null;
  setSelectedChannel: (channel: string | null) => void;
  session: Session;
  workspaceId: string;
  dmChannelId: string;
}

export function ChatView({
  selectedChannel,
  setSelectedChannel,
  selectedDM,
  session,
  workspaceId,
  dmChannelId,
}: Props) {
  const [userId, setUserId] = useState(session?.user?.id);
  const getDMTopic = (userId1: string, userId2: string): string => {
    const sortedIds = [userId1, userId2].sort();
    return `${sortedIds[0]}-${sortedIds[1]}`;
  };

  const dmTopic = getDMTopic(userId as string, selectedDM as string);
  const { messages, setMessages, sendMessage, connect, setActiveTopic } = useWebSocket();
  const { workspace } = session;
  const [isLoading, setIsLoading] = useState(false);
  const [channelInfo, setChannelInfo] = useState<Channel | null>(null);
  const [members, setMembers] = useState<Client[]>([]);
  const [dmUserInfo, setDmUserInfo] = useState<User | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true)
      if (channelInfo?.id && !selectedDM) {
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
        return;
      }

      if (selectedDM && dmChannelId && userId) {
        const response = await GetMessages({
          id: dmChannelId,
          queryParams: {
            offset: 0,
            limit: 100,
            name: dmTopic,
            order: "time",
            dir: "asc",
          },
        });

        if (response.data) {
          setMessages(response.data.messages);
        }
      }
      setIsLoading(false)
    };

    fetchMessages();
  }, [channelInfo?.id, selectedDM, dmTopic, dmChannelId, userId, setMessages]);


  useEffect(() => {
    const connectSocket = async () => {
      const userProfile = await UserProfile();
      if (userProfile.data !== null) {
        setUserId(userProfile.data.id as string);
        connect(
          workspace?.id as string,
          selectedChannel as string,
        );
      }
    };
    if (selectedChannel && workspace?.id) {
      connectSocket();
    }

  }, [workspace, selectedChannel, connect]);

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
        setSelectedChannel(selectedChannel);
      }
    };

    getData();
  }, [selectedChannel, setSelectedChannel]);

  useEffect(() => {
    const getData = async () => {
      const response = await ViewUser(selectedDM || "");
      if (response.data) {
        setDmUserInfo(response.data);
      }
    };

    getData();
  }, [selectedDM, session]);

  const handleSend = (input: string) => {
    if (input.trim()) {
      if (selectedDM && userId) {
        sendMessage({
          n: dmTopic,
          vs: input,
          t: Date.now() * 1e6,
          publisher: userId,
        })
      } else {
        sendMessage({
          n: "chat",
          vs: input,
          t: Date.now() * 1e6,
          publisher: userId,
        })
      }
    }
  }

  useEffect(() => {
    if (selectedDM) {
      setMessages([])
      setActiveTopic(dmTopic);
    } else {
      setActiveTopic(null);
    }
  }, [selectedDM, dmTopic, setActiveTopic, setMessages]);

  useEffect(() => {
    const getMembers = async () => {
      const response = await ListChannelMembers(
        {
          id: selectedChannel as string,
          queryParams: {
            offset: 0,
            limit: 100,
          },
        },
        workspaceId as string
      );
      if (response.data) {
        setMembers(response.data.members);
      }
    };
    getMembers();
  }, [selectedChannel, workspaceId]);

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

          {selectedDM ? (
            <>
              <MessageCircle className="h-5 w-5 text-gray-500" />
              <div>
                <h2 className="font-semibold text-gray-900">{dmUserInfo?.credentials?.username}</h2>
              </div>
            </>
          ) : (
            <>
              <Hash className="h-5 w-5 text-gray-500" />
              <div>
                <h2 className="font-semibold text-gray-900">{channelInfo?.name}</h2>
                {channelInfo?.tags?.includes("chat") && (
                  <p className="text-xs text-gray-500">
                    {members?.length} {members?.length === 1 ? "member" : "members"}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
        <EllipsisVertical className="h-4 w-4" />
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
