import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import io, { Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: any[];
}

const socketContext = createContext<SocketContextType | null>(null);

export const useSocketContext = () => {
  const context = useContext(socketContext);
  if (!context) {
    throw new Error("useSocketContext must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const { user } = useAuth();
  useEffect(() => {
    if (user) {
      const socketInstance = io("http://localhost:3000", {
        query: {
          userId: user,
        },
        withCredentials: true,
        reconnectionAttempts: 3,
        timeout: 2000,
      });
      setSocket(socketInstance);

      socketInstance.on("getOnlineUsers", (users) => {
        setOnlineUsers(users);
      });

      return () => {
        socketInstance.off("getOnlineUsers");
        socketInstance.close();
        setSocket(null);
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [user]);

  return (
    <socketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </socketContext.Provider>
  );
};
