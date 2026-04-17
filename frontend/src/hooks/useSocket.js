import { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

export const useSocket = (queueId) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const s = io(import.meta.env.VITE_SOCKET_URL);
    setSocket(s);

    s.on('connect', () => {
      setConnected(true);
      if (queueId) {
        s.emit('join_queue', queueId);
      }
    });

    s.on('disconnect', () => {
      setConnected(false);
    });

    return () => {
      s.disconnect();
    };
  }, [queueId]);

  const on = useCallback((event, callback) => {
    if (socket) {
      socket.on(event, callback);
    }
  }, [socket]);

  return { socket, connected, on };
};
