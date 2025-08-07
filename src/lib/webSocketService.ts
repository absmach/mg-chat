// lib/webSocketService.ts
class SuperMQWebSocket {
  private socket: WebSocket | null = null;
  private messageHandlers: Array<(data: any) => void> = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(
    private channelId: string,
    private thingSecret: string,
    private baseUrl = "ws://localhost:8186"
  ) {}

  connect() {
    const url = `${this.baseUrl}/m/74801133-cec2-4b91-a527-368eb83783d9/c/${this.channelId}?authorization=${this.thingSecret}" <<< '[{"bn": "DS-5000-AL1-001", "n": "Distance_AssemblyLine1", "u": "mm","v": 150}, { "n": "BatteryLevel", "u": "%", "v": 95}, { "n": "SignalStrength", "u": "dBm", "v": -65}]`;
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.messageHandlers.forEach(handler => handler(data));
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      this.attemptReconnect();
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => this.connect(), this.reconnectDelay * this.reconnectAttempts);
    }
  }

  subscribe(handler: (data: any) => void) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  send(message: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not open');
    }
  }

  disconnect() {
    this.socket?.close();
    this.socket = null;
  }
}

export const createSuperMQConnection = (channelId: string, thingSecret: string) => {
  return new SuperMQWebSocket(channelId, thingSecret);
};
