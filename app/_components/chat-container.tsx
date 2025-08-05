// components/Chat/ChatContainer.tsx
'use client';

import { useState, useEffect } from 'react';
import { createSuperMQConnection } from '../lib/webSocketService';
import { SenMLMessage } from '@absmach/magistrala-sdk';

export default function ChatContainer({
    channelId,
    thingSecret,
    senMLMessages,
}: {
    channelId?: string;
    thingSecret?: string;
    senMLMessages?: SenMLMessage[];
}) {
    const [messages, setMessages] = useState<SenMLMessage[]>(senMLMessages as SenMLMessage[]);
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

    useEffect(() => {
        const socket = createSuperMQConnection(channelId as string, thingSecret as string);

        socket.connect();

        const unsubscribe = socket.subscribe((message: SenMLMessage) => {
            setMessages(prev => [...prev, {
                channel: message.channel,
                content: message.string_value,
                timestamp: new Date(message.time || Date.now())
            }]);
        });

        return () => {
            unsubscribe();
            socket.disconnect();
        };
    }, [channelId, thingSecret]);

    const handleSendMessage = (content: string) => {
        if (!content.trim()) return;

        const message = {
            sender: 'current-user-id', // Replace with actual user ID
            content,
            timestamp: new Date().toISOString()
        };

        const socket = createSuperMQConnection(channelId as string, thingSecret as string);
        socket.send(message);

        // setMessages(prev => [...prev, {
        //     // id: Date.now().toString(),
        //     ...message
        // }]);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b">
                <h2 className="text-xl font-semibold">Channel: {channelId}</h2>
                <p className="text-sm">Status: {connectionStatus}</p>
            </div>

            {/* MessageList and MessageInput components remain the same */}
        </div>
    );
}