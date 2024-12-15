import {useState} from 'react';
import useConversation from './useConversation.ts';
import axios from 'axios';

const useSendMessage = () => {
    const [loading,setLoading] = useState(false);
    const {messages,setMessage}: any = useConversation();

    const sendMessage = async(id:any,message:any) => {
        // if(!selectedConversation) {
        //     console.log("No conversation selected");
        //     return;
        // }

        setLoading(true);
        try {
            const response = await axios.post(`http://localhost:3000/api/messages/send/${id}`,{
                message
            },{withCredentials:true}
        );

            setMessage([...messages,response.data]);
            setLoading(false);
        } catch(error) {
            console.log("Error in send messages", error);
            setLoading(false);
        }
    };

    return {loading,sendMessage};
};

export default useSendMessage;