import { BellRing, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import useGetNotifications from "./context/useGetNotifications.ts";
import axios from "axios";

export function NotificationCard() {
    const [notifications, setNotifications] = useState([]);

    useGetNotifications(setNotifications);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get("http://localhost:3000/api/users/getRequest", {
                    withCredentials: true,
                });

                setNotifications(response.data.friendRequests || []); 
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        };

        fetchNotifications();
    }, []);

    const handleAcceptRequest = async (friendId: string) => {
        try {
            await axios.post(
                `http://localhost:3000/api/users/acceptRequest`,
                {senderId: friendId},
                { withCredentials: true }
            );

            setNotifications((prev) =>
                prev.filter((notification: any) => notification._id !== friendId)
            );
        } catch (error) {
            console.error("Error accepting request:", error);
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                    {notifications.length > 0
                        ? `You have ${notifications.length} unread messages.`
                        : "You have no new notifications."}
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="flex items-center space-x-4 rounded-md border p-4">
                    <BellRing />
                    <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">Push Notifications</p>
                        <p className="text-sm text-muted-foreground">
                            Send notifications to your device.
                        </p>
                    </div>
                    <Switch />
                </div>
                <div>
                    {notifications.map((notification: any) => (
                        <div
                            key={notification._id}
                            className="mb-4 grid grid-cols-[25px_1fr_auto] items-start pb-4 last:mb-0 last:pb-0"
                        >
                            <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                            <div className="space-y-1">
                                <p className="text-sm font-medium leading-none">
                                    {notification.username} sent you a friend request!
                                </p>
                            </div>
                            <Button
                                size="sm"
                                onClick={() => handleAcceptRequest(notification._id)}
                                className="ml-4"
                            >
                                Accept
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={() => setNotifications([])}>
                    <Check /> Mark all as read
                </Button>
            </CardFooter>
        </Card>
    );
}
