import express from "express";
import {
	getAllDoctors,
	getSingleDoctor,
	login,
	logout,
	refreshToken,
	register,
} from "../controllers/doctors.controller";
import { authenticateUser, authorizePermissions } from "../middleware/authentication.middleware";

const router = express.Router();
router.get("/", authenticateUser, authorizePermissions("patient"), getAllDoctors);
router.post("/register", register);
router.post("/login", login);
router.post("/refreshToken", refreshToken);
router.get("/logout", logout);
router.get("/:id", authenticateUser, authorizePermissions("patient"), getSingleDoctor);

export default router;
