import {
	deleteAccount,
	getUserData,
	login,
	logout,
	refreshToken,
	register,
	removePhoto,
	updateUserInfo,
	updateUserPassword,
	uploadPhoto,
} from "../controllers/auth.controller";

import express from "express";
import {authenticateUser} from "../middleware/authentication.middleware";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refreshToken", refreshToken);
router.get("/me", authenticateUser, getUserData);
router.get("/logout", logout);
router.put("/me", authenticateUser, updateUserInfo);
router.delete("/me", authenticateUser, deleteAccount)
router.put("/me/updatePassword", authenticateUser, updateUserPassword);
router.put("/me/uploadPhoto", authenticateUser, uploadPhoto);
router.put("/me/deletePhoto", authenticateUser, removePhoto);

export default router;
