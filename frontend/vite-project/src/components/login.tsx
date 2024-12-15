import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronRight } from 'lucide-react';
import logo from '@/assets/logo.jpg';
import axios from 'axios';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

export default function LoginPage() {
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        const token = Cookies.get('token');
        if (token) {
            navigate('/', { replace: true });
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const toastId = toast.loading('Please wait while we log you in...');
        const data = { username, password, email };

        try {
            const res = await axios.post('http://localhost:3000/api/users/login', data ,{
                withCredentials: true,
            });
            if (res.data.success) {
                toast.success('Logged in successfully', { id: toastId });
                const { token, user } = res.data;
                Cookies.set('token', token, { expires: 7, secure: true });
                Cookies.set('user', user._id, { expires: 7, secure: true });

                setUser(user);
                navigate('/', { replace: true });
            } else {
                toast.error('Login failed. Please try again.', { id: toastId });
            }
        } catch (error) {
            console.error(error);
            toast.error('Error in logging in. Please try again later.', { id: toastId });
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
                <div className="flex justify-center mb-8">
                    <img src={logo} alt="WhatsApp Logo" className="w-20 h-20" />
                </div>
                <h1 className="text-2xl font-bold text-center mb-6">Login to WhatsApp</h1>
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
