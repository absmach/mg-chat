"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
// import { GetMessages } from "@/lib/messages";
import { Channel, Client, SenMLMessage } from "@absmach/magistrala-sdk";
import { Hash, Send } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useWebSocket, WebSocketMessage } from "../../../../hooks/useWebsocket";
import { UserInfo } from "@/types/auth";
import { GetClients } from "@/lib/clients";
import { AddMember } from "./add-members";

export default function ChatArea({ selectedChannel, user, domainId }: { selectedChannel: Channel, user: UserInfo, domainId: string }) {
    const [input, setInput] = useState("");
    const [clients, setClients] = useState<Client[]>([]);
    const [messages, setMessages] = useState<SenMLMessage[]>([]);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
    const { isConnected, sendMessage: sendWebSocketMessage, reconnect, connectionStatus } = useWebSocket({
        domainId,
        topic: selectedChannel.name as string,
        authorization: "aec2896f-f837-4256-a91e-a97403ee8b31",
        onMessage: (wsMessage: WebSocketMessage) => {
            console.log('Received WebSocket message:', wsMessage)

            if (wsMessage.type === 'typing') {
                // Handle typing indicators
                if (wsMessage.sender !== user.username) {
                    setTypingUsers(prev => {
                        if (!prev.includes(wsMessage.sender)) {
                            return [...prev, wsMessage.sender]
                        }
                        return prev
                    })

                    // Remove typing indicator after 3 seconds
                    setTimeout(() => {
                        setTypingUsers(prev => prev.filter(u => u !== wsMessage.sender))
                    }, 3000)
                }
            } else {
                // Handle regular messages
                const message: SenMLMessage = {
                    publisher: wsMessage.sender,
                    channel: wsMessage.channel,
                    string_value: wsMessage.content,
                    subtopic: wsMessage.channel,
                }

                setMessages(prev => {
                    // Avoid duplicate messages
                    const exists = prev.some(m => m.time === message.time && m.string_value === message.string_value)
                    if (exists) return prev
                    return [...prev, message]
                })
            }
        },
        onConnect: () => {
            console.log('Connected to WebSocket for channel:', selectedChannel)
        },
        onDisconnect: () => {
            console.log('Disconnected from WebSocket')
        },
        onError: (error) => {
            console.error('WebSocket error:', error)
        }
    })
    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || !isConnected) return

        // Send message via WebSocket
        sendWebSocketMessage(input.trim(), user.username || 'User')

        // Clear input
        setInput("")

        // Clear typing timeout
        if (typingTimeout) {
            clearTimeout(typingTimeout)
            setTypingTimeout(null)
        }
    }

    useEffect(() => {
        setMessages([])
        setTypingUsers([])
    }, [selectedChannel])

    const fetchData = useCallback(async () => {
        const updatedData = await GetClients({
            queryParams: {
                limit: 10,
                offset: 0,
                channel: selectedChannel.id
            },
        });
        if (updatedData.error !== null) {
            return;
        }

        setClients(updatedData.data.clients);
    }, [selectedChannel.id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    
    console.log("messages", messages);
    console.log("chan", selectedChannel);
    return (
        <>
            {selectedChannel.name ?
                <div className="flex-1 flex flex-col">
                    {/* Chat Header */}
                    <div className="p-4 bg-white border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="font-semibold text-lg flex items-center">
                                    <Hash className="h-5 w-5 mr-1" />
                                    {selectedChannel.name}
                                </h1>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-xs">
                                {clients?.length ?? 0} members
                                </Badge>
                                <AddMember channelId={selectedChannel?.id as string} />
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                            {messages?.map((message, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-sm">{message?.string_value}</span>
                                            {/* <span className="text-xs text-gray-500">
                                            {String((message?.time as number)).toLocaleTimeString()}
                                        </span> */}
                                        </div>
                                        <p className="text-sm text-gray-700">{message.string_value}</p>
                                    </div>
                                </div>
                            ))}

                            {messages.filter((msg) => msg.channel === selectedChannel).length === 0 && (
                                <div className="text-center py-8">
                                    <Hash className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        Welcome to #{selectedChannel.name}
                                    </h3>
                                    <p className="text-gray-500">
                                        This is the beginning of the #{selectedChannel.name} channel.
                                    </p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    <div className="p-4 bg-white border-t border-gray-200">
                        <form onSubmit={sendMessage} className="flex gap-2">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={`Message #${selectedChannel.name}`}
                                className="flex-1"
                            />
                            <Button type="submit" disabled={!input.trim()}>
                                <Send className="w-4 h-4" />
                            </Button>
                        </form>
                    </div>
                </div>
                :
                <div className="flex min-h-svh flex-col items-center justify-center text-center p-6 text-xl text-gray-600 max-w-2xl mx-auto">
                    Choose your channel — the chat awaits!  🧭💬
                </div>}
        </>
    )
}
