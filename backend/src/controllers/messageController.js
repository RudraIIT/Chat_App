import { getReceiverSocket, io } from "../socketIO/index.js";
import Conversation from "../models/conversationModel.js";
import mongoose from "mongoose";
import Message from "../models/messageModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import { generateRoomId } from "../utils/generateRoom.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

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

        const receiverSocket = getReceiverSocket(receiverId);

        if (receiverSocket) {
            // console.log("Emitting new message to receiver");
            io.to(receiverSocket).emit("newMessage", newMessage);
        }

        if (newMessage) {
            conversation.messages.push(newMessage._id);
        }

        await Promise.all([conversation.save(), newMessage.save()]);

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

export const initiateVideoCall = asyncHandler(async (req, res) => {
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    const receiverSocket = getReceiverSocket(receiverId);

    if (receiverSocket) {
        io.to(receiverSocket).emit("videoCall", {
            senderId,
            message: "Incoming video call...",
            roomId: generateRoomId(),  
        });
    }

    res.status(200).json({
        success: true,
        message: "Video call initiated.",
    });
});

export const acceptVideoCall = asyncHandler(async (req, res) => {
    const { roomId, senderId } = req.body; 
    const receiverId = req.user._id;
    const senderSocket = getReceiverSocket(senderId);
    const receiverSocket = getReceiverSocket(receiverId);

    if (senderSocket && receiverSocket) {
        io.to(senderSocket).emit("callAccepted", { roomId, receiverId });
        io.to(receiverSocket).emit("callAccepted", { roomId, senderId });
    }

    res.status(200).json({
        success: true,
        message: "Video call accepted.",
    });
});

export const rejectVideoCall = asyncHandler(async (req, res) => {
    const { senderId } = req.body;
    const receiverId = req.user._id;
    const senderSocket = getReceiverSocket(senderId);

    if (senderSocket) {
        io.to(senderSocket).emit("callRejected", { receiverId });
    }

    res.status(200).json({
        success: true,
        message: "Video call rejected.",
    });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "../../uploads");
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({storage});

export const uploadFile = [
    upload.single("file"),
    asyncHandler(async(req,res) => {
        const {id:receiverId} = req.params;
        const senderId = req.user._id;

        if(!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded.",
            });
        }

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
            message: `Uploaded on /uploads/${req.file.filename}`,
        });

        conversation.messages.push(newMessage._id);
        await Promise.all([conversation.save(), newMessage.save()]);

        const receiverSocket = getReceiverSocket(receiverId);
        if (receiverSocket) {
            io.to(receiverSocket).emit("newMessage", newMessage);
        }

        res.status(200).json({
            success: true,
            data: newMessage,
        });
    })
]

// export {sendMessage, getMessage};