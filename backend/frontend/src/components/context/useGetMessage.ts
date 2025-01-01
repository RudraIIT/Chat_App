import { useState,useEffect } from "react";
import useConversation from "./useConversation.ts";
import axios from "axios";

const useGetMessage = () => {
    const [loading,setLoading] = useState(false);
    const {messages,setMessage,selectedConversation} : any = useConversation();

    console.log("Selected Conversation ID:",selectedConversation._id);
    useEffect(() => {
        const getMessages = async() => {
            setLoading(true);
            if(selectedConversation && selectedConversation._id) {
                try {
                    const response = await axios.get(`http://localhost:3000/api/messages/get/${selectedConversation._id}`);
                    setMessage(response.data);
                    setLoading(false);
                } catch (error) {
                    console.log("Error in getting messages",error);
                    setLoading(false);
                }
            }
        };

        getMessages();
    },[selectedConversation, setMessage]);

    return {loading, messages};
};

export default useGetMessage;