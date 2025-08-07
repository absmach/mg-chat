"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
// import { GetMessages } from "@/lib/messages";
import { Channel, SenMLMessage } from "@absmach/magistrala-sdk";
import { Hash, Send } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function ChatArea({selectedChannel}: {selectedChannel: Channel}) {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<SenMLMessage[]>([])
    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim()) return

        const message: SenMLMessage = {
            time: Date.now(),
            channel: selectedChannel,
            // content: input,
            // timestamp: new Date(),
            // sender: user.username || 'User'
        }

        setMessages(prev => [...prev, message])
        setInput("")
    }
    // const fetchData = useCallback(async () => {
    //     const updatedData = await GetMessages({
    //         id: selectedChannel.id as string,
    //         queryParams: {
    //             limit: 10,
    //             offset: 0,
    //         },
    //     });
    //     if (updatedData.error !== null) {
    //         return;
    //     }

    //     setMessages(updatedData.data.messages)
    // }, []);

    // useEffect(() => {
    //     fetchData();
    // }, [fetchData]);
    console.log("messages", messages);
    return (
        <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 bg-white border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-semibold text-lg flex items-center">
                            <Hash className="h-5 w-5 mr-1" />
                            {selectedChannel.name}
                        </h1>
                        <p className="text-sm text-gray-600">
                            WebSocket communication between entities
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        {/* <Badge variant="outline" className="text-xs">
                            {members.length} members
                        </Badge> */}
                    </div>
                </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {messages?.map((message, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <Avatar className="w-8 h-8">
                                    <AvatarImage src="/placeholder.svg?height=32&width=32" />
                                    <AvatarFallback>
                                        {(message.channel as string)?.charAt(0) || "U"}
                                    </AvatarFallback>
                                </Avatar>
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

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200">
                <form onSubmit={sendMessage} className="flex gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={`Message #${selectedChannel}`}
                        className="flex-1"
                    />
                    <Button type="submit" disabled={!input.trim()}>
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </div>
    )
}