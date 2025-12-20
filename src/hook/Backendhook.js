import { useEffect, useRef, useState } from "react";
const wsUrl = import.meta.env.VITE_WS_URL;

function useBackendHook() {
  const [online, setOnline] = useState(0);
  const wsRef = useRef(null);

  useEffect(() => {
    let ws;

    function connect() {
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("✅ Connected to DotDrop WS");
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "presence") {
          setOnline(data.online);
        }
      };

      ws.onclose = () => {
        console.warn("⚠️ Disconnected from WS, retrying...");
        setTimeout(connect, 2000); // auto-reconnect after 2s
      };
    }

    connect();
    return () => ws && ws.close();
  }, []);

  return { online };
}

export default useBackendHook;