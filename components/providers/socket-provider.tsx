"use client";

import { SenMLMessage } from "@absmach/magistrala-sdk";
import { useSession } from "next-auth/react";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type WebSocketContextType = {
  messages: SenMLMessage[];
  setMessages: Dispatch<SetStateAction<SenMLMessage[]>>;
  sendMessage: (msg: object) => void;
  connect: (domainId: string, channelId: string) => void;
  disconnect: () => void;
  setActiveTopic: (topic: string | null) => void;
};

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const user = useSession();
  const token = user?.data?.accessToken;

  const connect = (domainId: string, channelId: string) => {
    const wsUrl = `ws://localhost:8186/m/${domainId}/c/${channelId}?authorization=Bearer%20${token}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log(`Connected to ${wsUrl}`);
    };

    ws.onmessage = async (event) => {
      let raw: string;

      if (typeof event.data === "string") {
        raw = event.data;
      } else if (event.data instanceof Blob) {
        raw = await event.data.text();
      } else {
        console.warn("Unknown message type:", event.data);
        return;
      }

      try {
        const parsed: any[] = JSON.parse(raw);
        const filtered = activeTopic
          ? parsed.filter((m) => m.n === activeTopic)
          : parsed;
        setMessages((prev) => {
          const existingKeys = new Set(prev.map((m) => `${m.n}-${m.t}`));
          const uniqueParsed = filtered.filter(
            (m) => !existingKeys.has(`${m.n}-${m.t}`)
          );
          return [...prev, ...uniqueParsed];
        });
      } catch (err) {
        console.error("Failed to parse message:", raw, err);
      }
    };
    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    ws.onclose = (event) => {
      console.log(`Connection closed: ${event.code} - ${event.reason}`);
    };

    wsRef.current = ws;
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  const sendMessage = (msg: object) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const payload = JSON.stringify([msg]);
      wsRef.current.send(payload);
    } else {
      console.warn("WebSocket not connected.");
    }
  };

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return (
    <WebSocketContext.Provider
      value={{ messages, setMessages, sendMessage, connect, disconnect, setActiveTopic }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const ctx = useContext(WebSocketContext);
  if (!ctx)
    throw new Error("useWebSocket must be used inside WebSocketProvider");
  return ctx;
};
