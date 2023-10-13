import express from "express";
import {
	getAllPatients,
	getSinglePatient,
	login,
	logout,
	refreshToken,
	register,
} from "../controllers/patients.controller";
import { authenticateUser } from "../middleware/authentication.middleware";

const router = express.Router();
router.get("/", getAllPatients);
router.post("/register", register);
router.post("/login", login);
router.post("/refreshToken", refreshToken);
router.get("/logout", logout);
router.get("/:id", getSinglePatient);
export default router;
