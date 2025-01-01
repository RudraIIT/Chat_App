import { useState,useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronRight } from 'lucide-react'
import logo from "@/assets/logo.jpg";
import axios from 'axios'
import { toast } from 'sonner'
import Cookies from 'node_modules/@types/js-cookie'
import { useNavigate } from 'react-router-dom'

export default function SignUpPage() {
    const navigate = useNavigate();
    
    useEffect(() => {
        const token = Cookies.get('token');
        if (token) {
            navigate('/');
        }
    }, []);

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [email, setEmail] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const toastId = toast.loading(
            "Please wait while we sign-up you in...",
        );

        const data = { 'username': username, 'password': password, 'email': email }
        // console.log(data);
        try {
            await axios.post("http://localhost:3000/api/users/register", data , {
                withCredentials: true,
            })
                .then((res) => {
                    console.log(res);
                    if (res.data.success) {
                        toast.success("Signed-Up in successfully", { id: toastId });
                        const token = res.data.token;
                        Cookies.set('token', token, { expires: 7, secure: true });
                        Cookies.set('user', res.data.user._id, { expires: 7, secure: true });
                        navigate('/');
                    }
                })
                .catch((error) => {
                    console.log(error);
                    toast.error("Error in signing in. Please try again later.", { id: toastId });
                })
        } catch (error) {
            toast.error("Error in signing in. Please try again later.", { id: toastId });
        }

    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
                <div className="flex justify-center mb-8">
                    <img src={logo} alt="WhatsApp Logo" className="w-20 h-20" />
                </div>
                <h1 className="text-2xl font-bold text-center mb-6">Sign-Up to WhatsApp</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="Username">Username</Label>
                        <Input
                            id="Username"
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <Label htmlFor="Email">Email</Label>
                        <Input
                            id="Email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Label htmlFor="Password">Password</Label>
                        <Input
                            id="Password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full bg-green-500 hover:bg-green-600">
                        Next
                        <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                </form>
                <p className="mt-6 text-center text-sm text-gray-600">
                    By tapping Next, you agree to our Terms and Privacy Policy.
                </p>
                {/* <div className="flex items-center justify-center">
                    <span className="text-sm text-gray-600">Already have an account?</span>
                </div> */}
                <div className="flex flex-col items-center justify-center space-y-2 mt-3">
                    <span className="text-sm text-gray-700">
                        Already have an account?
                    </span>
                    <button onClick={() => navigate('/login')} className="text-sm text-green-500 hover:underline mt-4">
                        Login
                    </button>
                </div>

            </div>
        </div>
    )
}

