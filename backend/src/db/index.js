import mongoose from "mongoose";

const DB_NAME = "chat-app";

const connectDB = async() => {
    try {
        console.log(process.env.MONGO_URI);
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
        console.log(`MongoDB connected: ${connectionInstance.connection.host}`);    
    } catch (error) {
        console.error(`ERROR: `, error);
        process.exit(1);
    }
}

export default connectDB;