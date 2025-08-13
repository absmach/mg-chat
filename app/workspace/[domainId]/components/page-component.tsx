"use client"

import { useState } from "react"
import ChatArea from "./chat-area"
import ChatContainer from "./chat.container"
import Header from "./header"
import UserProfile from "./user-profile"
import { Channel, User } from "@absmach/magistrala-sdk"
import { Member } from "@/types/entities"
import { UserInfo } from "@/types/auth"

export default function WorkspacePage({
    channels,
    members,
    userInfo,
    domainId,
    domainName,
    user,
}:{
    channels: Channel[];
    members: Member[];
    userInfo: UserInfo;
    domainId: string;
    domainName: string;
    user: User;
}) {
    const [selectedChannel, setSelectedChannel] = useState<Channel>({})
    return (
        <div className="flex h-screen bg-white">
            <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
                <Header domainName={domainName}/>
                <ChatContainer 
                channels={channels} 
                members={members} 
                selectedChannel={selectedChannel}
                setSelectedChannel={setSelectedChannel}
                domainId={domainId}
                user={user}/>
                <UserProfile user={userInfo} />
            </div>
            <ChatArea selectedChannel={selectedChannel} user={user} domainId={domainId}/>
        </div>
    )
}