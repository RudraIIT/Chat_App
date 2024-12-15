import {  useState } from 'react';
import logo from '@/assets/profile-pic.jpg';
import useGetAllUsers from './context/useGetAllUsers.ts';

interface ChatListProps {
  searchQuery: string;
  onSelectUser: (userId: string) => void; 
}

export default function ChatList({ searchQuery, onSelectUser }: ChatListProps) {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);

  const [allUsers, loading] = useGetAllUsers();
  console.log("All Users:",allUsers);

  const filteredUsers = Array.isArray(allUsers)
    ? allUsers.filter((user: any) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleUserSelect = (userId: string) => {
    console.log("handler User select:",userId);
    setSelectedChat(userId);
    onSelectUser(userId); 
  };

  return (
    <div className="overflow-y-auto h-[calc(100vh-120px)]">
      {loading && <p>Loading...</p>}

      {!loading &&
        filteredUsers.map((user: any) => (
          <div
            key={user._id}
            className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 ${selectedChat === user._id ? 'bg-gray-200' : ''}`}
            onClick={() => handleUserSelect(user._id)} 
          >
            <img
              src={logo}
              alt={user.username}
              className="w-12 h-12 rounded-full mr-3"
            />
            <div className="flex-1">
              <div className="flex justify-between items-baseline">
                <h3 className="font-semibold">{user.username}</h3>
                <span className="text-xs text-gray-500">N/A</span>
              </div>
              <p className="text-sm text-gray-600 truncate">No messages yet</p>
            </div>
          </div>
        ))}
    </div>
  );
}
