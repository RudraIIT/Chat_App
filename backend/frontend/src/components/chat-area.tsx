import {
  Phone,
  Video,
  MoreVertical,
  Smile,
  Paperclip,
  Mic,
  Send,
} from "lucide-react";
import { debounce } from "lodash";
import MessageList from "./message-list";
import { useEffect, useState, useCallback, useRef } from "react";
import logo from "@/assets/profile-pic.jpg";
import useSendMessage from "./context/useSendMessage.ts";
import axios from "axios";
import EmojiPicker from "emoji-picker-react";
import { useSocketContext } from "./context/SocketContext.tsx";
import useVideoCall from "./context/useVideoCall.ts";
import VideoCall from "./video-call.tsx";
import DotAnimation from "./dotAnimation/dot-animation.tsx";
import Cookies from "js-cookie";
import { usePeerContext } from "./context/PeerContext.tsx";
import { useToast } from "@/hooks/use-toast.ts";

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
  const mainUser = Cookies.get("user");
  const [message, setMessage] = useState("");
  const { sendMessage }: any = useSendMessage();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const {
    startCall,
    endCall,
    localStream,
    remoteStream,
    isInCall,
    answerCall,
    incomingCall,
  } = useVideoCall();
  const { socket } = useSocketContext();
  const { peer } = usePeerContext();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const {toast} = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSendFile = async () => {
    if (selectedFile && selectedUser) {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("receiverId", selectedUser.id);
      try {
        await axios.post(
          `https://chat-app-zegp.onrender.com/api/messages/upload/${selectedUser.id}`,
          formData,
          {
            withCredentials: true,
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        setSelectedFile(null);
      } catch (error) {
        console.error("Error sending file:", error);
      }
    }
  };

  useEffect(() => {
    if (showEmojiPicker) {
      emojiPickerRef.current?.classList.add("animate-slideUp");
    }
  }, [showEmojiPicker]);

  const handleEmoji = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleTyping = useCallback(() => {
    if (socket && selectedUser) {
      socket.emit("typing", { toUserId: selectedUser.id, fromUserId: mainUser });
    }
  }, [socket, selectedUser, mainUser]);

  useEffect(() => {
    if (!socket || !selectedUser) return;

    const handleIncomingTyping = ({ fromUserId }: { fromUserId: string }) => {
      if (fromUserId === selectedUser.id) {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
        }, 3000);
      }
    };

    socket.on("typing", handleIncomingTyping);

    return () => {
      socket.off("typing", handleIncomingTyping);
    };
  }, [socket, selectedUser]);

  const debouncedHandleTyping = useCallback(
    debounce(handleTyping, 500),
    [handleTyping]
  );

  const handleSendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (message.trim() && selectedUser) {
        await sendMessage(selectedUser.id, message);
        setMessage("");
      }
    },
    [message, selectedUser, sendMessage]
  );

  const handleVideoCall = async () => {
    if (selectedUser) {
      try {
        await startCall(selectedUser.id);
      } catch (error) {
        console.error("Error starting call:", error);
        alert("Unable to initiate video call");
      }
    }
  };

  useEffect(() => {
    if (!peer) return;
    const handleIncomingCall = (incomingCall: any) => {
      let confirmCall:boolean = false
      toast({
        title: 'Incoming Call',
        description: 'Incoming call from user',
        className: 'bg-green-500 text-white',
        onClick : () => confirmCall = true,
      })

      if (confirmCall) {
        answerCall(incomingCall);
      } else {
        incomingCall.close();
      }
    };

    peer.on("call", handleIncomingCall);

    return () => {
      peer.off("call", handleIncomingCall);
    };
  }, [peer, incomingCall, answerCall]);



  const toggleProfile = () => {
    setShowProfile(!showProfile);
  };

  const handleSpeechRecognition = useCallback(() => {
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      if (selectedUser) {
        setMessage(transcript);
      }
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  }, [selectedUser]);

  useEffect(() => {
    if (!selectedUser) return;

    const fetchUserData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `https://chat-app-zegp.onrender.com/api/users/getProfile/${selectedUser.id}`,
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
      {!isInCall && (
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
              <button onClick={handleVideoCall} className="text-gray-600 hover:text-gray-900">
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

          {showEmojiPicker && (
            <div ref={emojiPickerRef} className="absolute bottom-20 z-50 bg-white shadow-lg rounded-lg p-2 transform transition-transform duration-500 ease-in-out">
              <EmojiPicker
                onEmojiClick={(emojiObject) => {
                  console.log(emojiObject);
                  if (emojiObject && emojiObject.emoji) {
                    setMessage((prev) => prev + emojiObject.emoji);
                  }
                  // setShowEmojiPicker(false);
                }}
              />
            </div>
          )
          }

          {/* Message Input */}
          <div className="h-16 flex items-center space-x-4 px-4 bg-gray-100 relative">
            {isTyping && (
              <div className="absolute bottom-20 left-4 text-gray-500 text-sm">
                <DotAnimation />
              </div>
            )}
            <button onClick={handleEmoji} className="text-gray-600 hover:text-gray-900">
              <Smile className="h-6 w-6" />
            </button>
            <button
              className="text-gray-600 hover:text-gray-900"
              onClick={
                () => {
                  fileInputRef.current?.click();
                }
              }
            >
              <Paperclip className="h-6 w-6" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* File Upload Confirmation */}
            {selectedFile && (
              <div className="flex items-center space-x-2">
                <p className="text-gray-500 text-sm">{selectedFile.name}</p>
                <button
                  onClick={handleSendFile}
                  className="text-green-500 hover:text-green-600"
                >
                  <Send className="h-6 w-6" />
                </button>
              </div>
            )}
            <input
              type="text"
              placeholder="Type a message"
              className="flex-1 p-2 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
              value={message}
              onChange={
                (e) => {
                  if (selectedFile) {
                    handleFileChange(e);
                  }
                  setMessage(e.target.value);
                  debouncedHandleTyping();
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
                <Mic className={`h-6 w-6 ${isListening ? "animate-pulse" : ""}`} />
              </button>
            )}
          </div>
          {/* {handleTyping && <p className="text-gray-500 text-sm">User is typing...</p>} */}
        </div>
      )}

      {
        isInCall && (
          <VideoCall
            localStream={localStream.current}
            remoteStream={remoteStream.current}
            onEndCall={endCall}
          />
        )
      }
    </div>
  );
}
