import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";
let socket;

export function getSocket() {
  if (!socket) {
    const token = localStorage.getItem("token");
    socket = io(SOCKET_URL, {
      autoConnect: true,
      auth: { token },
    });
  }
  return socket;
}

export function refreshSocketAuth() {
  if (!socket) return;
  const token = localStorage.getItem("token");
  socket.auth = { token };
  if (socket.connected) {
    socket.disconnect();
  }
  socket.connect();
}
