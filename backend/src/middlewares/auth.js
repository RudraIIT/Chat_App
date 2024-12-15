import User from '../models/userModel.js';
import ApiError from '../utils/ApiError.js';
import jwt from 'jsonwebtoken';

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

export {isAuthenticatedUser};