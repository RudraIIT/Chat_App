import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import axios from "axios"
import { useToast } from "@/hooks/use-toast"
import { User } from 'lucide-react'
import logo from "@/assets/profile-pic.jpg"

interface User {
  _id: string
  username: string
  email: string
  publicKey: string
  friends: any[]
  friendRequests: any[]
  avatar?: string
  createdAt: string
  updatedAt: string
}

interface UserCardProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

export function UserCard({ isOpen, setIsOpen }: UserCardProps) {
  const [user, setUser] = useState<User | null>(null)
  const [friendEmail, setFriendEmail] = useState("")
  const userId = Cookies.get("user")
  const { toast } = useToast()

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await axios.get<User>(
          `https://chat-app-zegp.onrender.com/api/users/getProfile/${userId}`,
          {
            withCredentials: true,
          }
        )
        setUser(response.data)
      } catch (error) {
        console.error("Error fetching user:", error)
      }
    }
    if (userId && isOpen) getUser()
  }, [userId, isOpen])

  const handleSendRequest = async () => {
    const data = { senderId: userId, receiverEmail: friendEmail }
    try {
      const response = await axios.post(
        "https://chat-app-zegp.onrender.com/api/users/sendRequest",
        data,
        {
          withCredentials: true,
        }
      )
      if(response.data.statusCode === 200) {
        toast({
          title: "Friend Request Sent",
          description: "You have sent a friend request",
          className: "bg-green-500 text-white",
        })
        } else { 
            toast({
                title: "Friend Request Not Sent",
                description: "Failed to send friend request",
                className: "bg-red-500 text-white",
                variant: "destructive",
            })
        }
      setFriendEmail("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send friend request",
        className: "bg-red-500 text-white",
        variant: "destructive",
      })
      console.error("Error sending friend request:", error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px] bg-green-50">
        <DialogHeader>
          <DialogTitle className="text-green-700">User Profile</DialogTitle>
          <DialogDescription className="text-green-600">
            Manage your profile information.
          </DialogDescription>
        </DialogHeader>
        {!user ? (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 py-4">
              {/* Avatar */}
              <div className="flex justify-center">
                <img
                  src={user.avatar || logo}
                  alt={`${user.username}'s avatar`}
                  className="h-20 w-20 rounded-full border-2 border-green-500"
                />
              </div>

              {/* Username */}
              <div className="grid gap-2">
                <Label htmlFor="username" className="text-green-700">Username</Label>
                <Input
                  id="username"
                  value={user.username}
                  readOnly
                  className="cursor-not-allowed bg-green-50 border-green-200 text-green-700"
                />
              </div>

              {/* Email */}
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-green-700">Email</Label>
                <Input
                  id="email"
                  value={user.email}
                  readOnly
                  className="cursor-not-allowed bg-green-50 border-green-200 text-green-700"
                />
              </div>

              {/* Friend Requests */}
              <div className="grid gap-2">
                <Label htmlFor="friendRequests" className="text-green-700">Friend Requests</Label>
                <Input
                  id="friendRequests"
                  value={user.friendRequests?.length}
                  readOnly
                  className="cursor-not-allowed bg-green-50 border-green-200 text-green-700"
                />
              </div>

              {/* Send Friend Request */}
              <div className="grid gap-2">
                <Label htmlFor="sendFriendRequest" className="text-green-700">Friend&apos;s Email</Label>
                <div className="flex gap-2">
                  <Input
                    id="sendFriendRequest"
                    value={friendEmail}
                    onChange={(e) => setFriendEmail(e.target.value)}
                    placeholder="Enter friend's email"
                    className="bg-white border-green-200 text-green-700 placeholder:text-green-400 focus-visible:ring-green-500"
                  />
                  <Button 
                    onClick={handleSendRequest}
                    className="bg-green-500 text-white hover:bg-green-600 focus-visible:ring-green-500"
                  >
                    Send
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                className="border-green-500 text-green-700 hover:bg-green-50"
              >
                Close
              </Button>
              <Button 
                variant="outline"
                className="border-green-500 text-green-700 hover:bg-green-50"
              >
                Edit Profile
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

