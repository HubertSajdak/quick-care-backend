import express from "express";
import {
	getAllDoctors,
	getSingleDoctor,
	login,
	logout,
	refreshToken,
	register,
} from "../controllers/doctors.controller";

const router = express.Router();
router.get("/", getAllDoctors);
router.post("/register", register);
router.post("/login", login);
router.post("/refreshToken", refreshToken);
router.get("/logout", logout);
router.get("/:id", getSingleDoctor);

export default router;
