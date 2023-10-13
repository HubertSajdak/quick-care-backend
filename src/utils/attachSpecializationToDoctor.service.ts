import { DoctorDocument } from "../models/doctor.model";
import { SpecializationDocument } from "../models/specialization.model";

// export const attachSpecializationToDoctor = (
// 	doctors: DoctorDocument[],
// 	specializationNames: SpecializationDocument[]
// ) => {
// 	return doctors.map(doctor => {
// 		if (doctor.DoctorSpecialization && doctor.DoctorSpecialization.length) {
// 			const mappedSpecializations = doctor.DoctorSpecialization.map(specialization => {
// 				const findSpecialization = specializationNames.find(spec => spec._id === specialization.specializationId);
// 				return { specialization, specializationName: findSpecialization?.specializationKey };
// 			});
// 			return { ...doctor, specializations: mappedSpecializations };
// 		}
//     return doctor
// 	});
// };
