import mongoose from "mongoose";
import User from "./userModel.js";
import Message from "./messageModel.js";

const conversationSchema = new mongoose.Schema({
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: User,
        }
    ],
    messages: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: Message,
            default: []
        }
    ],
},
    {
        timestamps: true,
    }
);

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;