import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import axios from "axios"
import { useToast } from "@/hooks/use-toast"

export function getOtp() {
  const [email, setEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [value, setValue] = useState("")
  const {toast} = useToast()

  const sendOtp = async() => {
    try {
      const response = await axios.post("https://chat-app-zegp.onrender.com/api/users/getOtp", {
        email:email
      },{
        withCredentials:true
      });

      if (response.data.statusCode === 200) {
        console.log("OTP sent successfully");
        toast({
          title:"OTP Sent",
          description:"OTP sent to your email",
          className: "bg-green-500 text-white"
        })
      }

    } catch (error) {
      console.log(error);
      toast({
        title:"OTP Not Sent",
        description:"Failed to send OTP",
        className: "bg-red-500 text-white",
        variant: "destructive"
      })
    }
  }

  const handleOtp = async() => {
    try {
      const response = await axios.post("https://chat-app-zegp.onrender.com/api/users/resetPassword", {
        email:email,
        otp:value,
        newPassword:newPassword
      },{
        withCredentials:true
      });

      if (response.data.statusCode === 200) {
        console.log("OTP verified successfully");
        toast({
          title:"Password Reset",
          description:"Password reset successfully",
          className: "bg-green-500 text-white"
        })
      }

    } catch (error) {
      console.log(error);
      toast({
        title:"Password Reset",
        description:"Failed to reset password",
        className: "bg-red-500 text-white",
        variant: "destructive"
      })
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-sm text-green-500 hover:underline mt-4">Forgot Password</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] text-green-600">
        <DialogHeader>
          <DialogTitle>Forgot Password</DialogTitle>
          <DialogDescription>
            Change your password by entering the OTP sent to your email.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              Password
            </Label>
            <Input id="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="otp" className="text-right">
              OTP
            </Label>
            <InputOTP maxLength={6} value={value} onChange={(value) => setValue(value)}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>
        <DialogFooter>
        <Button type="submit" onClick={sendOtp} className="text-green-600 bg-white">Send Otp</Button>
          <Button type="submit" onClick={handleOtp} className="text-green-600 bg-white">Next</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
