import Cookies from 'node_modules/@types/js-cookie';
import { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios';

interface AuthContextType {
    user: any;
    setUser: React.Dispatch<any>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const initialUser : any = Cookies.get('user');

    // console.log(initialUser);

    const [user, setUser] = useState(initialUser);

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const handleLogout = async (setUser: React.Dispatch<any>) => {
    try {
        const response = await axios.post('http://localhost:3000/api/users/logout', {}, {
            withCredentials: true,
        });

        if (response.status === 200) {
            Cookies.remove('user');
            Cookies.remove('token');
            setUser(null); 
        }
    } catch (error) {
        console.error('Error during logout:', error);
        throw error;
    }
};

