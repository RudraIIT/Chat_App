import { useEffect, useState } from 'react';
import logo from '@/assets/profile-pic.jpg';
import useGetAllUsers from './context/useGetAllUsers.ts';
import axios from 'axios';

interface ChatListProps {
  searchQuery: string;
  onSelectUser: (userId: string) => void;
}

export default function ChatList({ searchQuery, onSelectUser }: ChatListProps) {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [userLastMessages, setUserLastMessages] = useState<{ [key: string]: string }>({});
  const [allUsers, loading] = useGetAllUsers();
  
  const filteredUsers = Array.isArray(allUsers)
    ? allUsers.filter((user: any) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleUserSelect = (userId: string) => {
    setSelectedChat(userId);
    onSelectUser(userId);
  };

  useEffect(() => {
    if (filteredUsers.length > 0) {
      const fetchLastMessages = async () => {
        const messages = await Promise.all(
          filteredUsers.map(async (user: any) => {
            try {
              const response = await axios.get(
                `http://localhost:3000/api/messages/getLastMessage/${user._id}`,
                { withCredentials: true }
              );
              return { userId: user._id, message: response.data.message || 'No messages yet' };
            } catch (error) {
              console.error(`Failed to fetch message for user ${user._id}`, error);
              return { userId: user._id, message: 'Error fetching message' };
            }
          })
        );

        const messagesMap = messages.reduce((acc: { [key: string]: string }, msg) => {
          acc[msg.userId] = msg.message;
          return acc;
        }, {});

        setUserLastMessages(messagesMap);
      };

      fetchLastMessages();
    }
  }, [filteredUsers]);

  return (
    <div className="overflow-y-auto h-[calc(100vh-120px)]">
      {loading && <p>Loading...</p>}

      {!loading &&
        filteredUsers.map((user: any) => (
          <div
            key={user._id}
            className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 ${
              selectedChat === user._id ? 'bg-gray-200' : ''
            }`}
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
              </div>
              <p className="text-sm text-gray-600 truncate">
                {userLastMessages[user._id] || 'Fetching last message...'}
              </p>
            </div>
          </div>
        ))}
    </div>
  );
}
