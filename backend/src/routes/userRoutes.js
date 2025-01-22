import { Router } from "express";
import { registerUser, loginUser, logoutUser,allUsers, getUserProfile, sendFriendRequest,getFriendRequests, acceptFriendRequest, getOtp, resetPassword } from "../controllers/userController.js";
import { isAuthenticatedUser, limiter } from "../middlewares/auth.js";
import rateLimiter from "../middlewares/rateLimiter.js";

const router = Router();
const rlimiter = rateLimiter(1, 1 / 300)
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/getProfile/:id', isAuthenticatedUser, getUserProfile);
router.get('/allusers', isAuthenticatedUser, allUsers);
router.post('/logout', isAuthenticatedUser, logoutUser);
router.post('/sendRequest', isAuthenticatedUser, sendFriendRequest);
router.get('/getRequest', isAuthenticatedUser, getFriendRequests);
router.post('/acceptRequest', isAuthenticatedUser, acceptFriendRequest);
router.post('/getOtp',rlimiter, getOtp);
router.post('/resetPassword', resetPassword);

export default router;