import express from "express";
import { editProfile, followOrUnfollow, getProfile, getSuggestedUsers, login, logout, register } from "../controllers/userController.js";
import auth from "../middlewares/userAuth.js"
import upload from "../middlewares/multer.js";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/:id/profile", auth, getProfile);
router.post("/profile/edit",auth,upload.single('profilePhoto'),editProfile);
router.get("/suggested",auth, getSuggestedUsers);
router.post("/followorunfollow/:id",auth, followOrUnfollow);

export default router;