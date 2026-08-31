import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000
});

export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export const joinEventRoom = (eventId) => {
  if (eventId) {
    socket.emit('join-event', eventId);
  }
};

export const leaveEventRoom = (eventId) => {
  if (eventId) {
    socket.emit('leave-event', eventId);
  }
};
