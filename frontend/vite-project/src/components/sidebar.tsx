import { Search, LogOut, Bell } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ChatList from './chat-list';
import logo from '@/assets/profile-pic.jpg';
import { handleLogout, useAuth } from './context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { NotificationCard } from './notification-card';

interface SidebarProps {
  onSelectUser: (userId: string) => void;
}

export default function Sidebar({ onSelectUser }: SidebarProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [notificationCount, setNotificationCount] = useState<number>(2);
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const { setUser } = useAuth();
  const notificationRef = useRef<HTMLDivElement | null>(null);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    console.log("Selected User ID:", userId);
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
    setShowNotification(!showNotification);
  }

  useEffect(() => {
    if(showNotification && notificationRef.current) {
      notificationRef.current.classList.add("animate-slideDown");
    }
  },[showNotification]);

  return (
    <div className="w-full sm:w-80 flex-shrink-0 border-r border-gray-300 bg-white">
      <div className="h-16 flex items-center justify-between px-4 bg-gray-200">
        <img src={logo} alt="Profile" className="w-10 h-10 rounded-full" />
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

      {/* Pass the `onSelectUser` callback to the `ChatList` */}
      <ChatList searchQuery={searchQuery} onSelectUser={onSelectUser} />
    </div>
  );
}
