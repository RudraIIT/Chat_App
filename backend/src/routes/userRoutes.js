import { Router } from "express";
import { registerUser, loginUser, logoutUser,allUsers, getUserProfile, sendFriendRequest,getFriendRequests, acceptFriendRequest } from "../controllers/userController.js";
import { isAuthenticatedUser } from "../middlewares/auth.js";

const router = Router();
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/getProfile/:id', isAuthenticatedUser, getUserProfile);
router.get('/allusers', isAuthenticatedUser, allUsers);
router.post('/logout', isAuthenticatedUser, logoutUser);
router.post('/sendRequest', isAuthenticatedUser, sendFriendRequest);
router.get('/getRequest', isAuthenticatedUser, getFriendRequests);
router.post('/acceptRequest', isAuthenticatedUser, acceptFriendRequest);

export default router;