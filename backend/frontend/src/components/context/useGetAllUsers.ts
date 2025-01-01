import { useState,useEffect } from "react";
import Cookies from "js-cookie";
import axios from "axios";

function useGetAllUsers() {
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const userId = Cookies.get('user');
    const token = Cookies.get('token');
    // console.log("User ID:",userId);
    // console.log("Token:",token);
    useEffect(() => {
        const getUsers = async () => {
            setLoading(true);
            try {
                if(userId && token) {
                    const response = await axios.get('https://chat-app-zegp.onrender.com/api/users/allusers', {
                        withCredentials: true,
                    });
                    setAllUsers(response.data);
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        getUsers();
    },[]);

    return [allUsers, loading];
}

export default useGetAllUsers;