import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_CONFIG } from '../config/api';

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  emit: (event: string, data: any) => void;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback?: (data: any) => void) => void;
  reconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');

  // Initialize WebSocket connection
  useEffect(() => {
    const initializeSocket = () => {
      // Check if WebSocket server is available
      const wsUrl = API_CONFIG.WEBSOCKET_URL;
      
      // Disable WebSocket connection for now to prevent errors
      const enableWebSocket = false;
      
      if (!enableWebSocket) {
        console.log('WebSocket disabled - running in offline mode');
        setConnectionStatus('disconnected');
        return;
      }

      const newSocket = io(wsUrl, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnection: false, // Disable reconnection to prevent spam
        autoConnect: false, // Don't auto-connect
      });

      newSocket.on('connect', () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setConnectionStatus('connected');
      });

      newSocket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason);
        setIsConnected(false);
        setConnectionStatus('disconnected');
      });

      newSocket.on('connect_error', (error) => {
        console.warn('WebSocket connection error (server not available):', error.message);
        setConnectionStatus('disconnected');
      });

      setSocket(newSocket);
      setConnectionStatus('connecting');
      
      // Try to connect
      newSocket.connect();
    };

    initializeSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  const emit = useCallback((event: string, data: any) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    } else {
      // Silently ignore when WebSocket is disabled
      console.log('WebSocket not available, event not sent:', event);
    }
  }, [socket, isConnected]);

  const on = useCallback((event: string, callback: (data: any) => void) => {
    if (socket) {
      socket.on(event, callback);
    }
  }, [socket]);

  const off = useCallback((event: string, callback?: (data: any) => void) => {
    if (socket) {
      if (callback) {
        socket.off(event, callback);
      } else {
        socket.off(event);
      }
    }
  }, [socket]);

  const reconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      socket.connect();
    }
  }, [socket]);

  const value: WebSocketContextType = {
    socket,
    isConnected,
    connectionStatus,
    emit,
    on,
    off,
    reconnect,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
