"use client";

import { useState, useEffect, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Hash, Plus, Settings } from "lucide-react";
import { Session } from "@/types/auth";
import { NavUser } from "./nav-user";
import { CreateChannelDialog } from "@/components/chat/create-channel-dialog";
import { ListChannels } from "@/lib/channels";
import { Channel } from "@absmach/magistrala-sdk";
import { set } from "date-fns";

interface Props {
  session: Session;
  selectedChannel: string | null;
  selectedDM: string | null;
  setSelectedChannel: (channelId: string | null) => void;
  setSelectedDM: (userId: string | null) => void;
}

export function Sidebar({
  session,
  selectedChannel,
  selectedDM,
  setSelectedChannel,
  setSelectedDM,
}: Props) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [revalidate, setRevalidate] = useState(false);
  const [directMessages, setDirectMessages] = useState<Channel[]>([]);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showInviteUser, setShowInviteUser] = useState(false);

  const workspaceId = session.domain?.id;

  const getData = useCallback(async () => {
    const groupResponse = await ListChannels({
      queryParams: { offset: 0, limit: 100, tag: "group" },
    });
    if (groupResponse.data) {
      setChannels(groupResponse.data.channels);
    } else {
      setChannels([]);
    }

    const directResponse = await ListChannels({
      queryParams: { offset: 0, limit: 100, tag: "direct" },
    });
    if (directResponse.data) {
      setDirectMessages(directResponse.data.channels);
    } else {
      setDirectMessages([]);
    }
  }, []);

  useEffect(() => {
    if (workspaceId) {
      getData();
    }
  }, [workspaceId]);

  useEffect(() => {
    if (revalidate) {
      getData();
      setRevalidate(false);
    }
  }, [revalidate, getData]);

  const handleSwitchWorkspace = () => {
    window.location.href = "/";
  };

  const domain = session.domain;
  return (
    <div className="h-full flex flex-col bg-gray-800 text-white">
      {/* Workspace Header */}
      <div className="p-4 border-b border-gray-700">
        <Button
          variant="ghost"
          className="cursor-pointer w-full justify-start p-2 h-auto text-white hover:bg-gray-700 items-center space-x-2"
          onClick={handleSwitchWorkspace}
        >
          <Avatar>
            <AvatarImage src={"/placeholder.svg"} />
            <AvatarFallback className=" text-black">
              {domain?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 text-left">
            <p className="font-semibold text-white truncate">
              {domain?.name || "Loading..."}
            </p>
            <p className="text-xs text-gray-300 truncate">{domain?.route}</p>
          </div>
          <Settings className="h-4 w-4 text-gray-400" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {/* Channels Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between px-2 py-1 mb-2">
              <span className="text-sm font-medium text-gray-300">
                Channels
              </span>
              <CreateChannelDialog setRevalidate={setRevalidate} />
            </div>

            <div className="space-y-1">
              {channels?.map((channel) => (
                <Button
                  key={channel.id}
                  variant="ghost"
                  className={`w-full justify-start px-2 py-1 h-auto text-gray-300 hover:bg-gray-700 hover:text-white ${
                    selectedChannel === channel.id
                      ? "bg-purple-600 text-white hover:bg-purple-700"
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedChannel(channel.id as string);
                    setSelectedDM(null);
                  }}
                >
                  <Hash className="h-4 w-4 mr-2" />
                  <span className="text-sm">{channel.name}</span>
                  {/* {channel.unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="ml-auto h-5 text-xs"
                    >
                      {channel.unreadCount}
                    </Badge>
                  )} */}
                </Button>
              ))}
            </div>
          </div>

          <Separator className="my-4 bg-gray-700" />

          {/* Direct Messages Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between px-2 py-1 mb-2">
              <span className="text-sm font-medium text-gray-300">
                Direct Messages
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                onClick={() => setShowInviteUser(true)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            {/* <div className="space-y-1">
              {directMessages?.map((dmUser) => {
                
                return (
                  <Button
                    key={dmUser.id}
                    variant="ghost"
                    className={`w-full justify-start px-2 py-1 h-auto text-gray-300 hover:bg-gray-700 hover:text-white ${
                      selectedDM === dmUser.id
                        ? "bg-purple-600 text-white hover:bg-purple-700"
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedChannel(null);
                      setSelectedDM(dmUser.id as string);
                    }}
                  >
                    <div className="relative mr-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={dmUser.avatar || "/placeholder.svg"}
                        />
                        <AvatarFallback className="text-xs bg-gray-600 text-white">
                          {dmUser.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-gray-800 ${
                          dmUser.isOnline ? "bg-green-500" : "bg-gray-400"
                        }`}
                      />
                    </div>
                    <span className="text-sm truncate">{dmUser.name}</span>
                  </Button>
                );
              })}
            </div> */}
          </div>
        </div>
      </ScrollArea>

      {/* User Profile */}
      <NavUser session={session} />
    </div>
  );
}
