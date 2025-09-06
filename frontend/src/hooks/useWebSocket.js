import { useEffect, useRef, useState } from 'react';

const useWebSocket = (url, onMessage) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);

  useEffect(() => {
    const connect = () => {
      try {
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('WebSocket connected:', url);
          setIsConnected(true);
          setError(null);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (onMessage) {
              onMessage(data);
            }
          } catch (err) {
            console.error('Error parsing WebSocket message:', err);
          }
        };

        ws.onclose = () => {
          console.log('WebSocket disconnected:', url);
          setIsConnected(false);
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setError('WebSocket connection failed');
          setIsConnected(false);
        };

      } catch (err) {
        console.error('Error creating WebSocket:', err);
        setError('Failed to create WebSocket connection');
        setIsConnected(false);
      }
    };

    // Add a small delay before connecting to avoid immediate failures
    const timeoutId = setTimeout(connect, 1000);

    return () => {
      clearTimeout(timeoutId);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [url, onMessage]);

  const sendMessage = (message) => {
    if (wsRef.current && isConnected) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  return { isConnected, error, sendMessage };
};

export default useWebSocket;
