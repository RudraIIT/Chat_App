import { Router } from "express";
import { getMessage,sendMessage } from "../controllers/messageController.js";
import { isAuthenticatedUser } from "../middlewares/auth.js";

const router = Router();

router.post("/send/:id",isAuthenticatedUser,sendMessage);
router.get("/get/:id",isAuthenticatedUser,getMessage);

export default router;