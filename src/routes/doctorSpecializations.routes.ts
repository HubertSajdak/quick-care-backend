import express from "express";
import {
	createCurrentDoctorSpecialization,
	deleteCurrentDoctorSpecialization,
	getAllDoctorSpecializations,
	getCurrentDoctorSpecializations,
	getSingleDoctorSpecializations,
} from "../controllers/doctorSpecializations.controller";
import { authenticateUser, authorizePermissions } from "../middleware/authentication.middleware";

const router = express.Router();
router.route("/").get(authenticateUser, getAllDoctorSpecializations);
router
	.route("/me")
	.post(authenticateUser, authorizePermissions("doctor"), createCurrentDoctorSpecialization)
	.get(authenticateUser, authorizePermissions("doctor"), getCurrentDoctorSpecializations);

router
	.route("/:id")
	.get(authenticateUser, getSingleDoctorSpecializations)
	.delete(authenticateUser, authorizePermissions("doctor"), deleteCurrentDoctorSpecialization);

export default router;
