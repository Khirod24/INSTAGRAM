import express from "express";
 import auth from "../middlewares/userAuth.js";
import upload from "../middlewares/multer.js";
import { getMessage, sendMessage } from "../controllers/messageController.js";

const router = express.Router();

router.route('/send/:id').post(auth, sendMessage);
router.route('/all/:id').get(auth, getMessage);
 
export default router;