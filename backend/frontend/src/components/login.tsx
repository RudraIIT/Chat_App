import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronRight } from 'lucide-react';
import logo from '@/assets/logo.jpg';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { getOtp } from './get-otp';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const {toast } = useToast();

    useEffect(() => {
        const token = Cookies.get('token');
        if (token) {
            navigate('/', { replace: true });
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const data = { username, password, email };

        try {
            const res = await axios.post('https://chat-app-zegp.onrender.com/api/users/login', data ,{
                withCredentials: true,
            });
            if (res.data.success) {
                toast({
                    title: 'Login Successful',
                    description: 'You have successfully logged in',
                    className: 'bg-green-500 text-white',
                })

                const { token, user } = res.data;
                Cookies.set('token', token, { expires: 7, secure: true });
                Cookies.set('user', user._id, { expires: 7, secure: true });

                setUser(user);
                navigate('/', { replace: true });
            } else {
                toast({
                    title: 'Login Failed',
                    description: 'Failed to login',
                    className: 'bg-red-500 text-white',
                    variant: 'destructive',
                })
            }
        } catch (error) {

            toast({
                title: 'Login Failed',
                description: 'Failed to login',
                className: 'bg-red-500 text-white',
                variant: 'destructive',
            })
            console.error(error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
                <div className="flex justify-center mb-8">
                    <img src={logo} alt="WhatsApp Logo" className="w-20 h-20" />
                </div>
                <h1 className="text-2xl font-bold text-center mb-6">Login to Chat-App</h1>
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
                    {getOtp()}
                </p>
                <div className="flex flex-col items-center justify-center space-y-2">
                    <button
                        onClick={() => navigate('/signup')}
                        className="text-sm text-green-500 hover:underline mt-4"
                    >
                        Signup
                    </button>
                </div>
            </div>
        </div>
    );
}
