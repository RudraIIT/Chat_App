import { Server } from "socket.io";
import http from "http";
import express from "express";
import { createAdapter } from "@socket.io/redis-streams-adapter";
import redis from "../redis/index.js";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
    },
    adapter: createAdapter(redis),
});

export const getReceiverSocket = (receiverId) => {
    return users[receiverId];
}

const users = {};

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
});

export {app,io,server};
