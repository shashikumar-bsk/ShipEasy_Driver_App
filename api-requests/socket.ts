import { io, Socket } from "socket.io-client";
import config from "./config";

interface RideRequestData {
  // Define expected properties for ride request data
}

class SocketService {
  private socket: Socket | null = null;

  connect(driverId: string) {
    if (!this.socket) {
      this.socket = io(config.SOCKET_URL, {
        reconnection: true,
        reconnectionAttempts: Infinity, 
        reconnectionDelay: 1000,
      });

      this.socket.on("connect", () => {
        console.log("Connected to socket server");
        this.socket!.emit("driver_connected", driverId);
      });

      this.socket.on("ride_requested", (data: RideRequestData) => {
        console.log("Ride request received:", data);
        // Handle ride request event
      });

      this.socket.on("ride_accepted", (data: any) => {
        console.log("Ride accepted:", data);
        // Handle ride accepted event
      });

      this.socket.on("disconnect", () => {
        console.error("Disconnected from socket server");
        // Try reconnecting or notify user
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event: string, data: any, p0: (response: any) => void) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }
}

const socketService = new SocketService();
export default socketService;
