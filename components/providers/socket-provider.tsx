"use client";

import { SenMLMessage } from "@absmach/magistrala-sdk";
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
  connect: (domainId: string, channelId: string, clientSecret: string) => void;
  disconnect: () => void;
};

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<SenMLMessage[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = (
    domainId: string,
    channelId: string,
    clientSecret: string
  ) => {
    const wsUrl = `ws://localhost:8186/m/${domainId}/c/${channelId}?authorization=${clientSecret}`;
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
        const parsed: SenMLMessage[] = JSON.parse(raw);
        console.log("Received:", parsed);

        setMessages((prev) => [...prev, ...parsed]);
        // spread because server may send an array
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
      value={{ messages, setMessages, sendMessage, connect, disconnect }}
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
