import bcryptjs from "bcryptjs";
import mongoose, { Document } from "mongoose";
import validator from "validator";
import { IsEmailOptions } from "validator/lib/isEmail";

export interface AddressExtended {
	street: string;
	city: string;
	postalCode: string;
	_id: string;
}

export interface PhotoExtended {
	originalName: string;
	url: string;
	filename: string;
	_id: string;
}

export interface PatientDocument extends Document {
	_id: string;
	name: string;
	surname: string;
	email: (str: string, options?: IsEmailOptions | undefined) => boolean;
	phoneNumber: number;
	address: AddressExtended;
	photo?: string;
	password: string;
	role: "patient";
	comparePassword: (candidatePassword: string) => Promise<boolean>;
}

const PatientSchema = new mongoose.Schema<PatientDocument>({
	name: {
		type: String,
		required: [true, "Required Field"],
		minlength: [2, "minimum 2 characters"],
		maxLength: [50, "maximum 50 characters"],
	},
	surname: {
		type: String,
		required: [true, "Required Field"],
		maxLength: [50, "maximum 50 characters"],
	},
	phoneNumber: {
		type: Number,
		required: [true, "Required Field"],
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
	address: {
		street: {
			type: String,
			required: [true, "Required Field"],
		},
		city: {
			type: String,
			required: [true, "Required Field"],
		},
		postalCode: {
			type: String,
			maxlength: [6, "Invalid postal code"],
			minlength: [6, "Invalid postal code"],
			required: [true, "Required Field"],
		},
	},
	photo: {
		type: String,
		default: null,
	},
	role: {
		type: String,
		enum: ["patient"],
		default: "patient",
	},
});
PatientSchema.pre("save", async function () {
	if (!this.isModified("password")) return;
	const salt = await bcryptjs.genSalt(10);
	this.password = await bcryptjs.hash(this.password, salt);
});
PatientSchema.methods.comparePassword = async function (candidatePassword: string) {
	const isMatch = await bcryptjs.compare(candidatePassword, this.password);
	return isMatch;
};
const PatientModel = mongoose.model<PatientDocument>("Patient", PatientSchema);
export default PatientModel;
