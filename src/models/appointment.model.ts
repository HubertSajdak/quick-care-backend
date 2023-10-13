import mongoose, { Document } from "mongoose";
import { AddressExtended } from "./patient.model";
export interface AppointmentDocument extends Document {
	_id: string;
	patientId: mongoose.SchemaDefinitionProperty<string>;
	doctorId: mongoose.SchemaDefinitionProperty<string>;
	clinicId: mongoose.SchemaDefinitionProperty<string>;
	clinicAffiliationId: mongoose.SchemaDefinitionProperty<string>;
	appointmentDate: string;
	appointmentAddress: AddressExtended;
	appointmentStatus: "active" | "canceled" | "postponed" | "completed";
	consultationFee: number;
}
const AppointmentSchema = new mongoose.Schema<AppointmentDocument>(
	{
		patientId: {
			type: mongoose.Types.ObjectId,
			required: [true, "required field"],
		},
		doctorId: {
			type: mongoose.Types.ObjectId,
			required: [true, "required field"],
		},
		clinicId: {
			type: mongoose.Types.ObjectId,
			required: [true, "required field"],
		},
		clinicAffiliationId: {
			type: mongoose.Types.ObjectId,
			required: [true, "required field"],
		},
		appointmentDate: {
			type: String,
			required: [true, "required field"],
		},
		appointmentAddress: {
			street: {
				type: String,
				required: [true, "required field"],
			},
			city: {
				type: String,
				required: [true, "Required Field"],
			},
			postalCode: {
				type: String,
				maxlength: [5, "has to be 5 characters long"],
				minlength: [5, "has to be 5 characters long"],
				required: [true, "Required Field"],
			},
		},
		appointmentStatus: {
			type: String,
			required: [true, "required field"],
		},
		consultationFee: {
			type: Number,
			required: [true, "required field"],
		},
	},
	{ toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
AppointmentSchema.virtual("doctorInfo", {
	ref: "Doctor",
	localField: "doctorId",
	foreignField: "_id",
	justOne: true,
});

AppointmentSchema.virtual("clinicInfo", {
	ref: "Clinic",
	localField: "clinicId",
	foreignField: "_id",
	justOne: true,
});
const AppointmentModel = mongoose.model<AppointmentDocument>("Appointment", AppointmentSchema);

export default AppointmentModel;
