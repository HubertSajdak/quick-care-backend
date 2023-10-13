import mongoose, { Document } from "mongoose";
export interface SpecializationDocument extends Document {
	_id: string;
	specializationKey: string;
}
const SpecializationSchema = new mongoose.Schema<SpecializationDocument>({
	specializationKey: {
		type: String,
		required: [true, "this field is required"],
	},
});

const SpecializationModel = mongoose.model<SpecializationDocument>("Specialization", SpecializationSchema);
export default SpecializationModel;
