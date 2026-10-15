import { io, Socket } from 'socket.io-client';
import { getTenantId } from './client';

const SOCKET_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('/api/v1', '') 
  : window.location.origin;

let socket: Socket | null = null;

export const getSensorsSocket = (): Socket => {
  if (!socket) {
    socket = io(`${SOCKET_URL}/sensors-ws`, {
      autoConnect: false,
      reconnection: false,
      transports: ['websocket'],
      timeout: 3000,
      extraHeaders: {
        'x-tenant-id': getTenantId(),
      }
    });

    socket.on('connect_error', () => {
      // Disconnect cleanly if WebSocket is not mounted on backend
      socket?.disconnect();
    });

    socket.on('connect', () => {
      console.log('✅ Connected to Sensors WebSocket');
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from Sensors WebSocket');
    });
  }
  
  return socket;
};
