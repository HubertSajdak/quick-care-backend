import mongoose, { Document } from "mongoose";
export interface DoctorSpecializationDocument extends Document {
	_id: string;
	specializationId: mongoose.SchemaDefinitionProperty<string> | undefined;
	doctorId: mongoose.SchemaDefinitionProperty<string> | undefined;
}
const DoctorSpecializationSchema = new mongoose.Schema<DoctorSpecializationDocument>(
	{
		specializationId: {
			type: mongoose.Types.ObjectId,
			ref: "Specialization",
			required: true,
		},
		doctorId: {
			type: mongoose.Types.ObjectId,
			ref: "Doctor",
			required: true,
		},
	},
	{ toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
DoctorSpecializationSchema.virtual("Specialization", {
	ref: "Specialization",
	localField: "specializationId",
	foreignField: "_id",
	justOne: true,
});
DoctorSpecializationSchema.virtual("SpecializationKey", {
	ref: "Specialization",
	localField: "specializationKey",
	foreignField: "specializationKey",
	justOne: true,
});
const DoctorSpecializationModel = mongoose.model<DoctorSpecializationDocument>(
	"DoctorSpecialization",
	DoctorSpecializationSchema
);
export default DoctorSpecializationModel;
