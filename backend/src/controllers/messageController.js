import { getReceiverSocket, io } from "../socketIO/index.js";
import Conversation from "../models/conversationModel.js";
import mongoose from "mongoose";
import Message from "../models/messageModel.js";
import asyncHandler from "../utils/asyncHandler.js";

export const sendMessage = asyncHandler(async (req, res) => {
    try {
        const { message } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;
        let conversation = await Conversation.findOne({
            members: { $all: [senderId, receiverId] },
        });

        if (!conversation) {
            conversation = await Conversation.create({
                members: [senderId, receiverId],
            });
        }

        const newMessage = new Message({
            sender: senderId,
            receiver: receiverId,
            message: message,
        });

        if (newMessage) {
            conversation.messages.push(newMessage._id);
        }

        await Promise.all([conversation.save(), newMessage.save()]);
        const receiverSocket = getReceiverSocket(receiverId);

        if (receiverSocket) {
            // console.log("Emitting new message to receiver");
            io.to(receiverSocket).emit("newMessage", newMessage);
            io.to(receiverSocket).emit("typing", senderId);
        }

        res.status(200).json({
            success: true,
            data: newMessage,
        });
    } catch (error) {
        console.log(`Error in sendMessage: `, error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

export const getMessage = asyncHandler(async (req, res) => {
    try {
        const { id: chatUserId } = req.params;
        const senderId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(chatUserId) || !mongoose.Types.ObjectId.isValid(senderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID or sender ID.",
            });
        }

        const chatUserObjectId = new mongoose.Types.ObjectId(chatUserId);
        const senderObjectId = new mongoose.Types.ObjectId(senderId);

        const conversation = await Conversation.findOne({
            members: { $all: [senderObjectId, chatUserObjectId] },
        }).populate("messages");

        if (!conversation) {
            console.log("No conversation found for members:", { senderObjectId, chatUserObjectId });
            return res.status(200).json([]);
        }
        
        const messages = conversation.messages;
        res.status(200).json(messages);
    } catch (error) {
        console.error(`Error in getMessage:`, error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

export const getLastMessage = asyncHandler(async (req, res) => {
    const currentUserId = req.user._id;
    const receiverId = req.params.id;

    const conversation = await Conversation.findOne({
        members: { $all: [currentUserId, receiverId] },
    }).populate("messages");

    if (!conversation) {
        return res.status(200).json([]);
    }

    const messages = conversation.messages;

    if (messages.length === 0) {
        return res.status(200).json([]);
    }

    const lastMessage = messages[messages.length - 1];

    res.status(200).json(lastMessage);
});


// export {sendMessage, getMessage};