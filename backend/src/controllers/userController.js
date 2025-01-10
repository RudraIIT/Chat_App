import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import User from "../models/userModel.js";
import sendToken from "../utils/jwtToken.js";
import crypto from 'crypto';
import asyncHandler from "../utils/asyncHandler.js";
import { getReceiverSocket,io } from "../socketIO/index.js";
import nodemailer from 'nodemailer';

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    const user = await User.create({
        username,
        email,
        password,
        publicKey: crypto.randomBytes(20).toString('hex'),
    });

    if (!user) {
        return res.json(new ApiError(500, 'User registration failed'));
    }

    sendToken(user, 201, res);
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json(new ApiError(400, 'Please enter email and password'));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return res.json(new ApiError(401, 'Invalid email or password'));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return res.json(new ApiError(401, 'Invalid email or password'));
    }

    sendToken(user, 200, res);
});

const logoutUser = asyncHandler(async (req, res) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });

    res.json(new ApiResponse(200, 'Logged out successfully'));
});

const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    res.status(200).json(user);

});

const allUsers = asyncHandler(async (req, res) => {
    const currentUser = req.user._id;
    const user = await User.findById(currentUser);
    const filteredUsers = user.friends;

    const friendsPromises = filteredUsers.map(async (element) => {
        return await User.findById(element);
    });

    const friends = await Promise.all(friendsPromises);

    res.status(200).json(friends);
});

const sendFriendRequest = asyncHandler(async (req, res) => {
    const {senderId, receiverEmail} = req.body;
    
    if (!senderId || !receiverEmail) {
        return res.status(400).json(new ApiError(400, "Invalid input"));
    } 

    
    const receiverId = await User.findOne({ email: receiverEmail });

    if (!receiverId) {
        return res.json(new ApiError(404, 'User not found'));
    }

    receiverId.friendRequests.push(senderId);

    await receiverId.save();

    const receiverSocket = getReceiverSocket(receiverId._id);
    const sender = await User.findById(senderId);

    if (receiverSocket) {
        io.to(receiverSocket).emit("newRequest", sender);
    }

    res.status(200).json(new ApiResponse(200, 'Friend request sent'));
});

const getFriendRequests = asyncHandler(async (req, res) => {
    const user = req.user._id;
    const requests = await User.findById(user).populate('friendRequests');
    res.status(200).json(requests);
});


const acceptFriendRequest = asyncHandler(async (req, res) => {
    const userId = req.user._id; 
    const { senderId } = req.body; 

    if (!senderId) {
        return res.status(400).json(new ApiResponse(400, "Sender ID is required"));
    }

    const userDocument = await User.findById(userId);
    if (!userDocument) {
        return res.status(404).json(new ApiResponse(404, "User not found"));
    }

    const senderDocument = await User.findById(senderId);
    if (!senderDocument) {
        return res.status(404).json(new ApiResponse(404, "Sender not found"));
    }

    if (!userDocument.friendRequests.includes(senderId)) {
        return res.status(400).json(new ApiResponse(400, "No friend request from this user"));
    }

    if (!userDocument.friends.includes(senderId)) {
        userDocument.friends.push(senderId);
    }

    if (!senderDocument.friends.includes(userId)) {
        senderDocument.friends.push(userId);
    }

    userDocument.friendRequests = userDocument.friendRequests.filter(
        (id) => id.toString() !== senderId
    );

    await senderDocument.save();
    await userDocument.save();

    res.status(200).json(new ApiResponse(200, "Friend request accepted successfully"));
});

const getOtp = asyncHandler(async(req,res) => {
    const {email} = req.body;

    if(!email) {
        return res.status(400).json(new ApiResponse(400, "Email is required"));
    }

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json(new ApiResponse(404, "User not found"));
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    // console.log('OTP:',otp);
    user.resetPasswordToken = otp;

    await user.save();

    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });
    
    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: email,
        subject: 'Password Reset OTP',
        text: `Your OTP is ${otp}`
    };

    console.log('Otp: ',otp);
    
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error:',error);
            return res.status(500).json({ status: 500, message: "Failed to send OTP" });
        }
        return res.status(200).json({ status: 200, message: "OTP sent successfully" });
    });
    

    res.status(200).json(new ApiResponse(200, `OTP sent to ${email}`));
});

const resetPassword = asyncHandler(async(req,res) => {

    const {email,otp, newPassword} = req.body;

    if (!email || !otp || !newPassword) {
        return res.status(400).json(new ApiResponse(400, "Invalid input"));
    }

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json(new ApiResponse(404, "User not found"));
    }

    if (user.resetPasswordToken !== otp) {
        return res.status(400).json(new ApiResponse(400, "Invalid OTP"));
    }

    user.password = newPassword;

    await user.save();

    return res.status(200).json(new ApiResponse(200, "Password reset successfully"));

});

export { registerUser, loginUser, logoutUser, allUsers, getUserProfile, sendFriendRequest,getFriendRequests, acceptFriendRequest, getOtp, resetPassword };