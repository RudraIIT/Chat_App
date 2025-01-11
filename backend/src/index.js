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

import cluster from 'cluster';
import os from 'os';

const totalCPUs = os.cpus().length;

if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`);

    for (let i = 0; i < totalCPUs; i++) {
        cluster.fork();
    }

    cluster.on("exit", worker => {
        console.log(`Worker ${worker.process.pid} is died`);
        console.log("Let's fork another worker!");
        cluster.fork();
    });
} else {
    dotenv.config();

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const deploy_dirname = path.resolve();

    app.set('trust proxy', 1);

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
    app.use(express.static(path.join(deploy_dirname, '/frontend/dist')))
    app.use(cookieParser());
    app.use(cors({
        origin: "https://chat-app-zegp.onrender.com",
        credentials: true,
    }));

    app.use('/api/users', userRoutes);
    app.use('/api/messages', messageRoutes);

    if (process.env.NODE_ENV === 'production') {
        app.get('*', (req, res) => {
            res.sendFile(path.resolve(deploy_dirname, "frontend", "dist", "index.html"));
        })
    } else {
        app.get('/', (req, res) => {
            res.send('API is running...');
        })
    }

    connectDB()
        .then(() => {
            server.listen(process.env.PORT || 3000, () => {
                console.log(`Server is running on port ${process.env.PORT || 3000}`)
            })
        })
        .catch((error) => {
            console.log('Error connecting to the database', error.message);
        })
}


