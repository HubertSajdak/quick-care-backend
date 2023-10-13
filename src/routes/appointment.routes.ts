import express from "express";
import { authenticateUser, authorizePermissions } from "../middleware/authentication.middleware";
import {
	cancelAppointment,
	createAppointment,
	getDoctorAppointments,
	getUserAppointments,
} from "../controllers/appointment.controller";

const router = express.Router();

router.route("/").post(authenticateUser, authorizePermissions("patient"), createAppointment);
router.route("/myAppointments").get(authenticateUser, authorizePermissions("doctor", "patient"), getUserAppointments);
router.route("/:id").get(authenticateUser, authorizePermissions("patient"), getDoctorAppointments);
router
	.route("/myAppointments/:id")
	.delete(authenticateUser, authorizePermissions("doctor", "patient"), cancelAppointment);

export default router;
