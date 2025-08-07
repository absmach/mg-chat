"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Member } from "@/types/entities";
import { Channel } from "@absmach/magistrala-sdk";

import { ChevronDown, ChevronRight, Hash, Plus } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { CreateChannelForm } from "./add-channel-dialog";

interface ChatContainerProps {
    channels: Channel[];
    members: Member[];
    selectedChannel: Channel;
    setSelectedChannel: Dispatch<SetStateAction<Channel>>;
}

export default function ChatContainer({ channels, members, selectedChannel, setSelectedChannel }: ChatContainerProps) {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['channels', 'members']))
    const toggleSection = (section: string) => {
        const newExpanded = new Set(expandedSections)
        if (newExpanded.has(section)) {
            newExpanded.delete(section)
        } else {
            newExpanded.add(section)
        }
        setExpandedSections(newExpanded)
    }
    return (
        <ScrollArea className="flex-1 px-2 py-4">
            <div className="space-y-4">
                {/* Channels Section */}
                <div>
                    <Button
                        variant="ghost"
                        className="w-full justify-start px-2 py-1 h-auto text-sm font-medium text-gray-700"
                        onClick={() => toggleSection('channels')}
                    >
                        {expandedSections.has('channels') ? (
                            <ChevronDown className="h-4 w-4 mr-1" />
                        ) : (
                            <ChevronRight className="h-4 w-4 mr-1" />
                        )}
                        Channels
                    </Button>

                    {expandedSections.has('channels') && (
                        <div className="ml-4 space-y-1 mt-2">
                            {channels.map((channel) => (
                                <Button
                                    key={channel.id}
                                    variant={selectedChannel === channel.name ? "secondary" : "ghost"}
                                    className="w-full justify-start px-2 py-1 h-auto"
                                    onClick={() => setSelectedChannel(channel)}
                                >
                                    <Hash className="h-4 w-4 mr-2" />
                                    <span className="text-sm flex-1 text-left">{channel.name}</span>
                                </Button>
                            ))}
                            {/* <Button
                                variant="ghost"
                                className="w-full justify-start px-2 py-1 h-auto text-gray-500"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                <span className="text-sm">Add Channel</span>
                            </Button> */}
                            <CreateChannelForm />
                        </div>
                    )}
                </div>

                {/* Members Section */}
                <div>
                    <Button
                        variant="ghost"
                        className="w-full justify-start px-2 py-1 h-auto text-sm font-medium text-gray-700"
                        onClick={() => toggleSection('members')}
                    >
                        {expandedSections.has('members') ? (
                            <ChevronDown className="h-4 w-4 mr-1" />
                        ) : (
                            <ChevronRight className="h-4 w-4 mr-1" />
                        )}
                        {/* <Users className="h-4 w-4 mr-1" /> */}
                        Members ({members.length})
                    </Button>

                    {expandedSections.has('members') && (
                        <div className="ml-4 space-y-2 mt-2">
                            {members.map((member, index) => (
                                <div key={index} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100">
                                    <div className="relative">
                                        <Avatar className="w-6 h-6">
                                            <AvatarImage src={member.profile_picture} />
                                            <AvatarFallback className="text-xs">
                                                {member?.credentials?.username?.charAt(0) || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                                    </div>
                                    <span className="text-sm text-gray-700">
                                        {member?.credentials?.username}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </ScrollArea>
    )
}