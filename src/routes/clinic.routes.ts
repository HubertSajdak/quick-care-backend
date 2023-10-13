import express from "express";
import { authenticateUser, authorizePermissions } from "../middleware/authentication.middleware";
import {
	createClinic,
	deleteClinic,
	getAllClinics,
	getSingleClinic,
	updateClinic,
	uploadClinicPhoto,
} from "../controllers/clinic.controller";

const router = express.Router();
router
	.route("/")
	.get(authenticateUser, getAllClinics)
	.post(authenticateUser, authorizePermissions("doctor"), createClinic);
router
	.route("/:id")
	.get(authenticateUser, getSingleClinic)
	.put(authenticateUser, authorizePermissions("doctor"), updateClinic)
	.delete(authenticateUser, authorizePermissions("doctor"), deleteClinic);
router.route("/uploadPhoto/:id").put(authenticateUser, authorizePermissions("doctor"), uploadClinicPhoto);
export default router;
