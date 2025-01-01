import { useEffect } from "react";
import { useSocketContext } from "./SocketContext.tsx";

const useGetNotifications = (updateNotifications: any) => {
    const { socket } = useSocketContext();

    useEffect(() => {
        if (socket) {
            console.log("Socket connected:", socket);

            socket.on("newRequest", (notification: any) => {
                console.log("New notification received:", notification);
                updateNotifications((prevNotifications: any) => [
                    ...prevNotifications,
                    notification,
                ]);
            });

            return () => {
                socket.off("newRequest");
            };
        }
    }, [socket, updateNotifications]);
};

export default useGetNotifications;
