import { Router } from "express";
import { getMessage,sendMessage,getLastMessage ,initiateVideoCall, uploadFile} from "../controllers/messageController.js";
import { isAuthenticatedUser } from "../middlewares/auth.js";

const router = Router();

router.post("/send/:id",isAuthenticatedUser,sendMessage);
router.get("/get/:id",isAuthenticatedUser,getMessage);
router.get("/getLastMessage/:id",isAuthenticatedUser,getLastMessage);
router.post('/videoCall/:id',isAuthenticatedUser,initiateVideoCall);
router.post('/upload/:id',isAuthenticatedUser,uploadFile);

export default router;