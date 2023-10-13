import express from "express";
import {
	createSpecialization,
	getAllSpecializations,
	getSingleSpecialization,
	updateSpecialization,
} from "../controllers/specializations.controller";
import { authenticateUser, authorizePermissions } from "../middleware/authentication.middleware";

const router = express.Router();
router.get("/", authenticateUser, getAllSpecializations);
router.post("/", authenticateUser, authorizePermissions("doctor"), createSpecialization);
router.patch("/:id", authenticateUser, authorizePermissions("doctor"), updateSpecialization);
router.get("/:id", authenticateUser, getSingleSpecialization);

export default router;
