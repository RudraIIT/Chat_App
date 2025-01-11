import Sidebar from './sidebar';
import ChatArea from './chat-area';
import { useState } from 'react';

export default function WhatsAppLayout() {
  const [selectedUserId, setSelectedUserId] = useState<{id:string} | null>(null);

  const handleUserSelect = (userId: string) => {
    // console.log("handleSelected User ID:", userId);
    setSelectedUserId({id:userId});
    // console.log("Selected User ID:", userId); 
  }

  return (
    // mobile layout
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar onSelectUser={handleUserSelect}/>
      <ChatArea selectedUser={selectedUserId}/>
    </div>
  )
}
