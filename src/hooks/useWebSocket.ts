import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

interface WebSocketHookProps {
  onNotificationReceived: (notification: any) => void;
}

export function useWebSocket({ onNotificationReceived }: WebSocketHookProps) {
  const { user } = useAuth();
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const client = new Client({
      // For modern browsers, we can use the brokerURL directly if SockJS is not strictly required.
      // But we are required to configure with SockJS as fallback in backend.
      // With stompjs v6, we use webSocketFactory for SockJS.
      webSocketFactory: () => new SockJS(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"}/ws`),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        // console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log("Connected to STOMP");
      client.subscribe(`/topic/notifications/${user.id}`, (message) => {
        if (message.body) {
          const notification = JSON.parse(message.body);
          onNotificationReceived(notification);
          toast.success(notification.title || "New Notification", {
            duration: 4000,
            position: "bottom-right",
            icon: "🔔",
          });
        }
      });
    };

    client.onStompError = (frame) => {
      console.error("Broker reported error: " + frame.headers["message"]);
      console.error("Additional details: " + frame.body);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [user?.id, onNotificationReceived]);

  return clientRef;
}
