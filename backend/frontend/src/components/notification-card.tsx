import { BellRing, Check } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { useEffect, useState } from "react"
import useGetNotifications from "./context/useGetNotifications"
import axios from "axios"
import { useToast } from "@/hooks/use-toast"

interface NotificationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NotificationCard({ open, onOpenChange }: NotificationDialogProps) {
  const [notifications, setNotifications] = useState([])
  const { toast } = useToast()

  useGetNotifications(setNotifications)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(
          "https://chat-app-zegp.onrender.com/api/users/getRequest",
          {
            withCredentials: true,
          }
        )

        setNotifications(response.data.friendRequests || [])
      } catch (error) {
        console.error("Error fetching notifications:", error)
      }
    }

    if (open) {
      fetchNotifications()
    }
  }, [open])

  const handleAcceptRequest = async (friendId: string) => {
    try {
      await axios.post(
        `https://chat-app-zegp.onrender.com/api/users/acceptRequest`,
        { senderId: friendId },
        { withCredentials: true }
      )

      setNotifications((prev) =>
        prev.filter((notification: any) => notification._id !== friendId)
      )

      toast({
        title: "Friend Request Accepted",
        description: "You have accepted the friend request",
        className: "bg-green-500 text-white",
      })
    } catch (error) {
      console.error("Error accepting request:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notifications</DialogTitle>
          <DialogDescription>
            {notifications.length > 0
              ? `You have ${notifications.length} unread messages.`
              : "You have no new notifications."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 text-green-500">
          <div className="flex items-center space-x-4 rounded-md border p-4">
            <BellRing className="h-5 w-5" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">
                Push Notifications
              </p>
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
                  className="ml-4 text-green-500"
                >
                  Accept
                </Button>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6">
          <Button
            className="w-full text-green-500"
            variant="outline"
            onClick={() => setNotifications([])}
          >
            <Check className="mr-2 h-4 w-4" /> Mark all as read
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

