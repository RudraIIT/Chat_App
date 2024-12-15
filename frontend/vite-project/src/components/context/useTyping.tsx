import { useSocketContext } from "./SocketContext.tsx"; 
import { useState, useCallback } from "react";

const useTyping = (selectedUser: { id: string } | null) => {
  const { socket } = useSocketContext(); 
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null); 

  const handleTyping = useCallback(
    (e: any) => {
      if (socket && selectedUser && e.target.value !== "") {
        socket.emit("typing", {
          senderId: selectedUser.id
        });

        if (typingTimeout) {
          clearTimeout(typingTimeout);
        }

        const timeout = setTimeout(() => {
          socket.emit("typing", {
            recipientId: selectedUser.id,
            typing: false, 
          });
        }, 1000); 
        setTypingTimeout(timeout);
      }
    },
    [selectedUser, socket, typingTimeout] 
  );

  return handleTyping;
};

export default useTyping;
