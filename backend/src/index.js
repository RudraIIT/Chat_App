import 'dotenv/config';
import connectDB from './db/index.js';
import { server } from './socketIO/index.js';

import express from 'express';
import path from "path";
import { fileURLToPath } from 'url';
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from 'cookie-parser';
import { app } from './socketIO/index.js';

import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));

app.use('/api/users',userRoutes);
app.use('/api/messages',messageRoutes);

connectDB()
    .then(() => {
        server.listen(process.env.PORT || 3000, () => {
            console.log(`Server is running on port ${process.env.PORT || 3000}`)
        })
    })
    .catch((error) => {
        console.log('Error connecting to the database', error.message);
    })


