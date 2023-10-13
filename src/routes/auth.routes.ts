import {
	login,
	register,
	logout,
	refreshToken,
	getUserData,
	updateUserInfo,
	updateUserPassword,
	uploadPhoto,
} from "../controllers/auth.controller";

import express from "express";
import { authenticateUser } from "../middleware/authentication.middleware";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refreshToken", refreshToken);
router.get("/me", authenticateUser, getUserData);
router.get("/logout", logout);
router.put("/me", authenticateUser, updateUserInfo);
router.put("/me/updatePassword", authenticateUser, updateUserPassword);
router.put("/me/uploadPhoto", authenticateUser, uploadPhoto);

export default router;
