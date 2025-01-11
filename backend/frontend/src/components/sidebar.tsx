import { Search, LogOut, Bell } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ChatList from './chat-list';
import logo from '@/assets/profile-pic.jpg';
import { handleLogout, useAuth } from './context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { NotificationCard } from './notification-card';
import { UserCard } from './user-card';
import useGetNotifications from './context/useGetNotifications';
import axios from 'axios';

interface SidebarProps {
  onSelectUser: (userId: string) => void;
}

export default function Sidebar({ onSelectUser }: SidebarProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notification, setNotification] = useState([]);
  useGetNotifications(setNotification);
  const [notificationCount, setNotificationCount] = useState<number>(notification.length);
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [showProfile, setShowProfile] = useState<boolean>(false);
  const { setUser } = useAuth();
  const notificationRef = useRef<HTMLDivElement | null>(null);
  // const userRef = useRef<HTMLDivElement | null>(null);use ref

  useEffect(() => {
    // console.log("Notification:", notification);
    setNotificationCount(notification.length);
  }, [notification])

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get("https://chat-app-zegp.onrender.com/api/users/getRequest", {
          withCredentials: true,
        });

        setNotification(response.data.friendRequests || []);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleLogoutFunction = async () => {
    try {
      await handleLogout(setUser);
      navigate('/login');
    } catch (error) {
      console.log("Logout failed:", error);
    }
  }

  const handleBellClick = () => {
    setNotificationCount(0);
    if (!showNotification) {
      setShowProfile(false);
    }
    setShowNotification(!showNotification);
  }

  const handleUserProfile = () => {
    if (!showProfile) {
      setShowNotification(false);
    }
    setShowProfile(!showProfile);
  }

  // useEffect(() => {
  //   if (showNotification && notificationRef.current) {
  //     notificationRef.current.classList.add("animate-slideDown");
  //   }
  // }, [showNotification]);

  // useEffect(() => {
  //   if (showProfile && userRef.current) {
  //     userRef.current.classList.add("animate-slideDown");
  //   }
  // }, [showProfile]);

  return (
    <div className="w-full sm:w-80 flex-shrink-0 border-r border-gray-300 bg-white">
      <div className="h-16 flex items-center justify-between px-4 bg-gray-200">
        <button onClick={handleUserProfile} className='hover:bg-gray-300 rounded-full p-1'>
          <img src={logo} alt="Profile" className="w-10 h-10 rounded-full" />
        </button>
        <div className="flex space-x-4">
          <button className="relative" onClick={handleBellClick}>
            <Bell className="h-6 w-6 text-gray-600 hover:text-gray-900" />
            {notificationCount > 0 && (
              <span className="absolute -top-2 -right-2 flex items-center justify-center h-5 w-5 bg-red-500 text-white text-xs rounded-full">
                {notificationCount}
              </span>
            )}
          </button>
          <button onClick={handleLogoutFunction} className="text-gray-600 hover:text-gray-900">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="p-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Search or start new chat"
            className="w-full p-2 pl-8 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={searchQuery}
            onChange={handleSearch}
          />
          <Search className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Show the `NotificationCard` if `showNotification` is true */}
      {showNotification && (
        <div
          ref={notificationRef}
          className="fixed top-10 left-0 w-full max-w-md mx-auto mt-4 p-4 bg-white shadow-lg rounded transform transition-transform duration-500 ease-in-out"
        >
          <NotificationCard />
        </div>
      )
      }

      {
        showProfile && (
            <UserCard />
        )
      }

      {/* Pass the `onSelectUser` callback to the `ChatList` */}
      <ChatList searchQuery={searchQuery} onSelectUser={onSelectUser} />
    </div>
  );
}
