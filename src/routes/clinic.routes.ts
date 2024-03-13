import express from "express";
import {
	createClinic,
	deleteClinic,
	deleteClinicPhoto,
	getAllClinics,
	getSingleClinic,
	updateClinic,
	uploadClinicPhoto,
} from "../controllers/clinic.controller";
import { authenticateUser, authorizePermissions } from "../middleware/authentication.middleware";

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
router
	.route("/uploadPhoto/:id")
	.put(authenticateUser, authorizePermissions("doctor"), uploadClinicPhoto)
	.delete(authenticateUser, authorizePermissions("doctor"), deleteClinicPhoto);
export default router;
