import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import logo from "../assets/profile-pic.jpg";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";

interface User {
    _id: string;
    username: string;
    email: string;
    publicKey: string;
    friends: any[];
    friendRequests: any[];
    avatar?: string;
    createdAt: string;
    updatedAt: string;
}

export function UserCard() {
    const [user, setUser] = useState<User | null>(null); 
    const [friendEmail, setFriendEmail] = useState("");
    const userId = Cookies.get("user");

    useEffect(() => {
        const getUser = async () => {
            try {
                const response = await axios.get<User>(`http://localhost:3000/api/users/getProfile/${userId}`, {
                    withCredentials: true,
                });
                setUser(response.data);
            } catch (error) {
                console.error("Error fetching user:", error);
            }
        };
        if (userId) getUser(); 
    }, [userId]);

    const handleSendRequest = async () => {
        const data = {senderId: userId, receiverEmail: friendEmail};
        try {
            const response = await axios.post("http://localhost:3000/api/users/sendRequest", data, {
                withCredentials: true,
            });
            console.log(response);
        } catch (error) {
            console.error("Error sending friend request:", error);
        }
    };

    if (!user) {
        return <p>Loading...</p>; 
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>User Profile</CardTitle>
                <CardDescription>Manage your profile information.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid w-full items-center gap-4">
                    {/* Avatar */}
                    <div className="flex justify-center mb-4">
                        <img
                            src={user.avatar || logo} 
                            alt={`${user.username}'s avatar`}
                            className="w-24 h-24 rounded-full border border-gray-300"
                        />
                    </div>

                    {/* Username */}
                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            value={user.username}
                            readOnly
                            className="cursor-not-allowed"
                        />
                    </div>

                    {/* Email */}
                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            value={user.email}
                            readOnly
                            className="cursor-not-allowed"
                        />
                    </div>

                    {/* Friend Requests */}
                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="friendRequests">Friend Requests</Label>
                        <Input
                            id="friendRequests"
                            value={user.friendRequests?.length}
                            readOnly
                            className="cursor-not-allowed"
                        />
                    </div>

                    {/*Send Friend Request to particular email */}
                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="sendFriendRequest">Friend's Email</Label>
                        <Input
                            id="sendFriendRequest"
                            value = {friendEmail}
                            onChange={(e) => setFriendEmail(e.target.value)}
                        />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="outline">Edit Profile</Button>
                <Button onClick={handleSendRequest} className="hover:bg-gray-600">Send Request</Button>
            </CardFooter>
        </Card>
    );
}
