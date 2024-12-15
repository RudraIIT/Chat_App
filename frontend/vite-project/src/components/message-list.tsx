import { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import useGetSocketMessage from './context/useGetSocketMessage.ts';

interface message{
  _id: any;
  sender: string;
  message: string;
  createdAt: string;
}

export default function MessageList(userId:any) {
  const [messages, setMessages] = useState([]);
  // console.log(userId);
  useGetSocketMessage(userId, setMessages);

  useEffect(() => {
    // const userId = Cookies.get('user'); 
    // console.log(userId);

    const fetchMessages = async () => {
      try {
        // console.log("User ID:", userId.userId);
        const response = await axios.get(`http://localhost:3000/api/messages/get/${userId.userId}`, {
          withCredentials: true,
        });
        setMessages(response.data);
        
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [userId]);

  const lastMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#e5ddd5]">
      {messages.map((message:message) => (
        <div
          key={message._id}
          ref = {lastMessageRef}
          className={`flex ${message.sender === Cookies.get('user') ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-xs px-4 py-2 rounded-lg ${
              message.sender === Cookies.get('user') ? 'bg-green-100' : 'bg-white'
            }`}
          >
            <p>{message.message}</p>
            <p className="text-xs text-gray-500 text-right mt-1">
              {new Date(message.createdAt).toLocaleTimeString([],{hour: '2-digit', minute:'2-digit'})}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
