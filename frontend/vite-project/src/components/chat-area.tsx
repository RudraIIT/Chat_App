import {
  Phone,
  Video,
  MoreVertical,
  Smile,
  Paperclip,
  Mic,
  Send,
} from "lucide-react";
import MessageList from "./message-list";
import { useEffect, useState, useCallback } from "react";
import logo from "@/assets/profile-pic.jpg";
import useSendMessage from "./context/useSendMessage.ts";
import axios from "axios";
import { UserProfileCard } from "./user-profile.tsx";
import useTyping from "./context/useTyping.tsx";
interface ChatAreaProps {
  selectedUser: {
    id: string;
  } | null;
}

interface UserData {
  username: string;
  profilePicture?: string;
}

export default function ChatArea({ selectedUser }: ChatAreaProps) {
  const [message, setMessage] = useState("");
  const { sendMessage }: any = useSendMessage();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [isListening, setIsListening] = useState(false);
  // const handleTyping = useTyping(selectedUser);

  const handleSendMessage = useCallback(
    async (e: any) => {
      e.preventDefault();

      if (message.trim() && selectedUser) {
        await sendMessage(selectedUser.id, message);
        setMessage("");
      }
    },
    [message, selectedUser, sendMessage]
  );

  const toggleProfile = () => {
    setShowProfile(!showProfile);
  };

  const handleSpeechRecognition = useCallback(
    async () => {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = "en-US";

      recognition.onstart = function() {
        setIsListening(true);
      }

      recognition.onresult = function (e:any) {
        const transcript = e.results[0][0].transcript;
        if(selectedUser) {
          setMessage(transcript);
        }
      }

      recognition.onend = function() {
        setIsListening(false);
        recognition.stop();
      }

      recognition.start();

    },[message,selectedUser, sendMessage]
  );

  useEffect(() => {
    if (!selectedUser) return;

    const fetchUserData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `http://localhost:3000/api/users/getProfile/${selectedUser.id}`,
          {
            withCredentials: true,
          }
        );
        setUserData(response.data);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [selectedUser]);

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Select a user to start chatting.
      </div>
    );
  }

  return (
    <div className="flex-1 flex">
      {/* Profile Card */}
      <div className={`transition-all duration-300 ${showProfile ? "w-1/5" : "w-0"} bg-white shadow-lg overflow-hidden flex`}>
        {showProfile && userData && (
          <UserProfileCard />
        )}
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${showProfile ? "w-3/4" : "w-full"}`}>
        {/* Chat Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-300 bg-gray-100">
          {loading ? (
            <p className="text-gray-500">Loading user info...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            userData && (
              <div className="flex items-center">
                <img
                  src={userData.profilePicture || logo}
                  alt={userData.username}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <h2 className="font-semibold">{userData.username}</h2>
                  <p className="text-xs text-gray-600">{"online"}</p>
                </div>
              </div>
            )
          )}

          <div className="flex space-x-4">
            <button className="text-gray-600 hover:text-gray-900">
              <Phone className="h-5 w-5" />
            </button>
            <button className="text-gray-600 hover:text-gray-900">
              <Video className="h-5 w-5" />
            </button>
            <button
              onClick={toggleProfile}
              className="text-gray-600 hover:text-gray-900"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Message List */}
        <MessageList userId={selectedUser.id} />

        {/* Message Input */}
        <div className="h-16 flex items-center space-x-4 px-4 bg-gray-100">
          <button className="text-gray-600 hover:text-gray-900">
            <Smile className="h-6 w-6" />
          </button>
          <button className="text-gray-600 hover:text-gray-900">
            <Paperclip className="h-6 w-6" />
          </button>
          <input
            type="text"
            placeholder="Type a message"
            className="flex-1 p-2 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            value={message}
            onChange={
              (e) => {
                setMessage(e.target.value);
                // handleTyping(e);
              }
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSendMessage(e);
              }
            }}
          />
          {message.trim() ? (
            <button
              className="text-green-500 hover:text-green-600"
              onClick={handleSendMessage}
            >
              <Send className="h-6 w-6" />
            </button>
          ) : (
            <button onClick={handleSpeechRecognition} className="text-gray-600 hover:text-gray-900">
              <Mic className={`h-6 w-6 ${isListening ? "animate-pulse":""}`} />
            </button>
          )}
        </div>
        {/* {handleTyping && <p className="text-gray-500 text-sm">User is typing...</p>} */}
      </div>
    </div>
  );
}
