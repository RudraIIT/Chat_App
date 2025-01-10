import User from '../models/userModel.js';
import ApiError from '../utils/ApiError.js';
import jwt from 'jsonwebtoken';
import {rateLimit} from 'express-rate-limit';

const isAuthenticatedUser = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return next(new ApiError(401, 'Login first to access this resource'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        next();
    } catch (error) {
        return next(new ApiError(401, 'Login first to access this resource'));
    }

}

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100,
    message: "Too many requests from this IP, please try again after 15 minutes",
})

export {isAuthenticatedUser, limiter};