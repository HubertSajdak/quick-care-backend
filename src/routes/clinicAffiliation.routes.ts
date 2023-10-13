import express from "express";
import {
	createCurrentDoctorClinicAffiliation,
	deleteClinicAffiliation,
	getAllClinicAffiliations,
	getCurrentUserClinicAffiliations,
	getDoctorClinicAffiliations,
	getSingleClinicAffiliation,
	updateClinicAffiliation,
} from "../controllers/clinicAffiliation.controller";
import { authenticateUser, authorizePermissions } from "../middleware/authentication.middleware";

const router = express.Router();
router
	.route("/")
	.get(authenticateUser, getAllClinicAffiliations)
	.post(authenticateUser, authorizePermissions("doctor"), createCurrentDoctorClinicAffiliation);
router
	.route("/userClinicAffiliations")
	.get(authenticateUser, authorizePermissions("doctor"), getCurrentUserClinicAffiliations);
router
	.route("/:id")
	.get(authenticateUser, getSingleClinicAffiliation)
	.put(authenticateUser, authorizePermissions("doctor"), updateClinicAffiliation)
	.delete(authenticateUser, authorizePermissions("doctor"), deleteClinicAffiliation);
router.route("/doctorClinicAffiliations/:id").get(authenticateUser, getDoctorClinicAffiliations);
export default router;
