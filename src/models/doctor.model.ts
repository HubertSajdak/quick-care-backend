import bcryptjs from "bcryptjs";
import mongoose, { Document } from "mongoose";
import validator from "validator";
import { IsEmailOptions } from "validator/lib/isEmail";
import { DoctorSpecializationDocument } from "./doctorSpecialization.model";
export interface DoctorDocument extends Document {
	_id: string;
	name: string;
	surname: string;
	email: (str: string, options?: IsEmailOptions | undefined) => boolean;
	password: string;
	professionalStatement?: string;
	photo?: string;
	role: "doctor";
	comparePassword: (candidatePassword: string) => Promise<boolean>;
	DoctorSpecialization: mongoose.SchemaDefinitionProperty<DoctorSpecializationDocument>[] | undefined;
	doctorSpecializations: string[];
}
const DoctorSchema = new mongoose.Schema<DoctorDocument>(
	{
		name: {
			type: String,
			required: [true, "Required Field"],
			minLength: [2, "minimum 2 characters"],
			maxLength: [50, "maximum 50 characters"],
		},
		surname: {
			type: String,
			required: [true, "Required Field"],
			maxLength: [50, "maximum 50 characters"],
		},
		email: {
			type: String,
			required: [true, "Required Field"],
			unique: true,
			validate: {
				message: "Invalid Email",
				validator: validator.isEmail,
			},
		},
		password: {
			type: String,
			required: [true, "Required Field"],
			minLength: [8, "minimum 8 characters"],
		},
		professionalStatement: {
			type: String,
			required: false,
			default: null,
		},
		photo: {
			type: String,
			default: null,
		},
		role: {
			type: String,
			enum: ["doctor"],
			default: "doctor",
		},
		// doctorSpecializations: [
		// 	{
		// 		type: String,
		// 	},
		// ],
	},
	{ toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

DoctorSchema.virtual("DoctorSpecialization", {
	ref: "DoctorSpecialization",
	localField: "_id",
	foreignField: "doctorId",
	justOne: false,
});
DoctorSchema.virtual("ClinicAffiliation", {
	ref: "ClinicAffiliation",
	localField: "_id",
	foreignField: "doctorId",
	justOne: false,
});
DoctorSchema.pre("save", async function () {
	if (!this.isModified("password")) return;
	const salt = await bcryptjs.genSalt(10);
	this.password = await bcryptjs.hash(this.password, salt);
});
DoctorSchema.methods.comparePassword = async function (candidatePassword: string) {
	const isMatch = await bcryptjs.compare(candidatePassword, this.password);
	return isMatch;
};

const DoctorModel = mongoose.model<DoctorDocument>("Doctor", DoctorSchema);
export default DoctorModel;
