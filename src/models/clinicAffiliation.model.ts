import mongoose, { Document } from "mongoose";
import { AddressExtended } from "./patient.model";
export interface AbsenceTimeValues {
	from: Date | string;
	to: Date | string;
}
export interface WorkingHours {
	weekDay: string;
	startTime: string;
	stopTime: string;
}
export interface ClinicAffiliationDocument extends Document {
	_id: string;
	doctorId: mongoose.SchemaDefinitionProperty<string>;
	clinicId: mongoose.SchemaDefinitionProperty<string>;
	clinicName: string;
	workingTime: WorkingHours[];
	available: boolean;
	reasonOfAbsence?: string | null;
	absenceTime?: AbsenceTimeValues | null;
	consultationFee: number;
	timePerPatient: number;
}

const ClinicAffiliationSchema = new mongoose.Schema<ClinicAffiliationDocument>(
	{
		doctorId: {
			type: mongoose.Types.ObjectId,
			required: [true, "required field"],
		},
		clinicId: {
			type: mongoose.Types.ObjectId,
			ref: "Clinic",
			required: [true, "required field"],
		},
		clinicName: {
			type: String,
			required: [true, "required field"],
		},
		workingTime: [
			{
				weekDay: {
					type: String,
				},
				startTime: {
					type: String,
					maxlength: [5, "has to be 5 character long"],
				},
				stopTime: {
					type: String,
					maxlength: [5, "has to be 5 character long"],
				},
			},
		],
		available: {
			type: Boolean,
		},
		reasonOfAbsence: {
			type: String,
			nullable: true,
		},
		absenceTime: {
			from: {
				type: Date,
			},
			to: {
				type: Date,
			},
		},
		consultationFee: {
			type: Number,
			required: [true, "required field"],
		},
		timePerPatient: {
			type: Number,
			required: [true, "required field"],
		},
	},
	{ toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
ClinicAffiliationSchema.virtual("clinicInfo", {
	ref: "Clinic",
	localField: "clinicId",
	foreignField: "_id",
	justOne: true,
});
const ClinicAffiliationModel = mongoose.model<ClinicAffiliationDocument>("ClinicAffiliation", ClinicAffiliationSchema);
export default ClinicAffiliationModel;
