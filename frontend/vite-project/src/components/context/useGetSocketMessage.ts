import { useEffect } from "react";
import { useSocketContext } from "./SocketContext.tsx";
import notification from "@/assets/notification_tone.mp3";

const useGetSocketMessage = (conversationId:any,updateMessages:any) => {
    const { socket } = useSocketContext();
    // console.log("Socket:",socket);
    useEffect(() => {
        if(socket) {
            socket.on("newMessage", (message:any) => {
                console.log("New Message:",message.receiver);
                console.log("Conversation ID:",conversationId.userId);
                const notificationSound = new Audio(notification);
                if(message.receiver === conversationId.userId || message.sender === conversationId.userId) {
                    notificationSound.play();
                    updateMessages((prevMessages:any) => [...prevMessages, message]);
                }
            });

            return () => {
                socket.off('typing');
                socket.off("newMessage");
            }
        }
    },[socket, conversationId.userId, updateMessages]);
};

export default useGetSocketMessage;