import { Server } from "socket.io";
import http from "http";
import express from "express";
import { createAdapter } from "@socket.io/redis-streams-adapter";
import redis from "../redis/index.js";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "https://chat-app-zegp.onrender.com",
        methods: ["GET", "POST"],
        credentials: true,
    },
    adapter: createAdapter(redis),
});

export const getReceiverSocket = (receiverId) => {
    return users[receiverId];
}

const users = {};
const rooms = {};

io.on("connection", (socket) => {
    console.log("New connection: ", socket.id);

    const userId = socket.handshake.query.userId;
    if(userId) {
        users[userId] = socket.id;
    }

    io.emit("getOnlineUsers", Object.keys(users));

    socket.on("disconnect", () => {
        console.log("User disconnected: ", socket.id);
        delete users[userId];
        io.emit("getOnlineUsers", Object.keys(users));
    });

    socket.on("typing", ({ toUserId, fromUserId }) => {
        console.log(`Typing event received: from ${fromUserId} to ${toUserId}`);
        
        const receiverSocket = getReceiverSocket(toUserId);
        if (receiverSocket) {
            console.log(`Broadcasting typing event to socket ID: ${receiverSocket}`);
            io.to(receiverSocket).emit("typing", { fromUserId });
        } else {
            console.log(`No active socket found for user: ${toUserId}`);
        }
    });

    socket.on("create-room", ({user1,user2}) => {
        const roomId = `${user1}-${user2}`;
        rooms[roomId] = {user1,user2};
        io.to(users[user1]).emit("send-offer",{roomId});
        io.to(users[user2]).emit("receive-offer",{roomId});
    });

    socket.on("offer", ({roomId,sdp}) => {
        const room = rooms[roomId];
        if(room) {
            const receiverId = room.user1 === userId ? room.user2 : room.user1;
            io.to(users[receiverId]).emit("offer",{sdp,roomId});
        }
    });

    socket.on("answer" , ({roomId,sdp}) => {
        const room = rooms[roomId];
        if(room) {
            const receiverId = room.user1 === userId ? room.user2 : room.user1;
            io.to(users[receiverId]).emit("answer",{sdp,roomId});
        }
    });

    socket.on("ice-candidate", ({roomId,iceCandidate}) => {
        const room = rooms[roomId];
        if(room) {
            const receiverId = room.user1 === userId ? room.user2 : room.user1;
            io.to(users[receiverId]).emit("ice-candidate",{iceCandidate,roomId});
        }
    });
});

export {app,io,server};
