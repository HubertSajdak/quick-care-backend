import moment from "moment";
import AppointmentModel, { AppointmentDocument } from "../models/appointment.model";

export const completeAppointment = async (appointmentsArray: AppointmentDocument[]) => {
	return appointmentsArray.forEach(async appointment => {
		const now = new Date();
		const parseDate = new Date(Date.parse(appointment.appointmentDate));
		const formatAppointmentDate = moment(parseDate).format("Do MMMM yyyy, HH:mm");
		const formatNowDate = moment(now).format("Do MMMM yyyy, HH:mm");

		if (
			appointment.appointmentStatus !== "completed" &&
			appointment.appointmentStatus !== "canceled" &&
			moment(formatNowDate, "Do MMMM yyyy, HH:mm").isSameOrAfter(moment(formatAppointmentDate, "Do MMMM yyyy, HH:mm"))
		) {
			await AppointmentModel.updateOne({ _id: appointment._id }, { appointmentStatus: "completed" });
		}
	});
};
