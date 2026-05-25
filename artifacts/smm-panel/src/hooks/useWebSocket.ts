import { useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

type WsMessage = {
  type: "connected" | "notification" | "order_update" | "balance_update";
  title?: string;
  message?: string;
  notifType?: "success" | "error" | "info" | "warning";
};

export function useWebSocket(token: string | null): void {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queryClient = useQueryClient();

  const connect = useCallback(() => {
    if (!token) return;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const url = `${protocol}//${window.location.host}/api/ws?token=${encodeURIComponent(token)}`;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
        reconnectRef.current = null;
      }
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const data: WsMessage = JSON.parse(event.data as string);

        if (data.type === "notification" && data.title) {
          const desc = data.message;
          if (data.notifType === "success") {
            toast.success(data.title, { description: desc });
          } else if (data.notifType === "error") {
            toast.error(data.title, { description: desc });
          } else if (data.notifType === "warning") {
            toast.warning(data.title, { description: desc });
          } else {
            toast.info(data.title, { description: desc });
          }
          void queryClient.invalidateQueries({ queryKey: ["listNotifications"] });
        }

        if (data.type === "order_update") {
          void queryClient.invalidateQueries({ queryKey: ["listOrders"] });
          void queryClient.invalidateQueries({ queryKey: ["getDashboardStats"] });
          void queryClient.invalidateQueries({ queryKey: ["getMe"] });
        }

        if (data.type === "balance_update") {
          void queryClient.invalidateQueries({ queryKey: ["getMe"] });
        }
      } catch {
        // ignore parse errors
      }
    };

    ws.onclose = () => {
      reconnectRef.current = setTimeout(() => connect(), 4000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [token, queryClient]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [connect]);
}
