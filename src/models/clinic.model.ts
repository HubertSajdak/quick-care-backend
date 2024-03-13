import mongoose, { Document } from "mongoose";
import { AddressExtended } from "./patient.model";

export interface WorkingTime {
	weekDay: string;
	startTime: string;
	stopTime: string;
}
export interface ClinicDocument extends Document {
	_id: string;
	clinicName: string;
	address: AddressExtended;
	phoneNumber: number;
	workingTime: WorkingTime[];
	photo?: string;
}

const ClinicSchema = new mongoose.Schema<ClinicDocument>({
	clinicName: {
		type: String,
		required: [true, "required field"],
	},
	address: {
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
			maxlength: [6, "has to be 6 characters long"],
			minlength: [6, "has to be 6 characters long"],
			required: [true, "Required Field"],
		},
	},
	phoneNumber: {
		type: Number,
		required: [true, "required field"],
	},
	workingTime: [
		{
			weekDay: {
				type: String,
				minlength: [3, "has to be 3 character long"],
				required: [true, "required field"],
			},
			startTime: {
				type: String,
				required: [false],
				default: "",
			},
			stopTime: {
				type: String,
				required: [false],
				default: "",
			},
		},
	],
	photo: {
		type: String,
		default: null,
	},
});

const ClinicModel = mongoose.model<ClinicDocument>("Clinic", ClinicSchema);
export default ClinicModel;
