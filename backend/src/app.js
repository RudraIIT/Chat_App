import express from 'express';
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from 'cookie-parser';
import { app } from './socketIO/index.js';

import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

dotenv.config();

app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.use('/api/users',userRoutes);
app.use('/api/messages',messageRoutes);

export {app};