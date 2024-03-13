import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { t } from "i18next";
import BadRequestError from "../errors/bad-request";
import NotFoundError from "../errors/not-found";
import DoctorModel from "../models/doctor.model";
import DoctorSpecializationModel, { DoctorSpecializationDocument } from "../models/doctorSpecialization.model";
import SpecializationModel from "../models/specialization.model";

export interface IDoctorRequest extends Request {
	body: {
		specializationId: string;
	};
	user?: {
		userId: string;
		name: string;
		surname: string;
		role: "patient" | "doctor" | "admin";
	};
}

export const getAllDoctorSpecializations = async (req: Request, res: Response) => {
	const doctorsSpecializations = await DoctorSpecializationModel.find({});
	if (!doctorsSpecializations) {
		throw new NotFoundError(t("errors.SPECIALIZATIONS_NOT_FOUND"));
	}
	return res.status(StatusCodes.OK).json({ data: doctorsSpecializations, totalItems: doctorsSpecializations.length });
};
export const getSingleDoctorSpecializations = async (req: Request, res: Response) => {
	const doctorId = req.params.id;

	const doctorSpecializations = await DoctorSpecializationModel.find({ doctorId });
	if (!doctorSpecializations) {
		throw new NotFoundError(t("errors.SPECIALIZATIONS_NOT_FOUND"));
	}
	return res.status(StatusCodes.OK).json({ data: doctorSpecializations, totalItems: doctorSpecializations.length });
};
export const getDoctorsBySpecialization = (req: Request, res: Response) => {};

//LOGGED IN DOCTOR CONTROLLERS
export const getCurrentDoctorSpecializations = async (req: IDoctorRequest, res: Response) => {
	const userId = req.user?.userId;
	if (!userId) {
		throw new BadRequestError(t("errors.DOCTOR_NOT_LOGGED_IN"));
	}
	const doctorSpecializations = await DoctorSpecializationModel.find({ doctorId: userId }).populate({
		path:"Specialization"
	});
	if (!doctorSpecializations) {
		throw new NotFoundError(t("errors.SPECIALIZATIONS_NOT_FOUND"));
	}
	return res.status(StatusCodes.OK).json({ data: doctorSpecializations, totalItems: doctorSpecializations.length });
};
export const createCurrentDoctorSpecialization = async (req: IDoctorRequest, res: Response) => {
	const { specializationId } = req.body;
	const userId = req.user?.userId;
	if (!userId) {
		throw new BadRequestError(t("errors.DOCTOR_NOT_LOGGED_IN"));
	}
	const isSpecialization = await SpecializationModel.findOne({ _id: specializationId });
	if (!isSpecialization) {
		throw new NotFoundError(`${t("errors.SPECIALIZATION_NOT_FOUND")}`);
	}
	const isDoctor = await DoctorModel.findOne({ _id: userId });
	if (!isDoctor) {
		throw new NotFoundError(`${t("errors.DOCTOR_NOT_FOUND")} ${userId}`);
	}
	const isDoctorSpecialization = await DoctorSpecializationModel.findOne({ specializationId, doctorId: userId });
	if (isDoctorSpecialization) {
		throw new BadRequestError(t("errors.DOCTOR_SPECIALIZATION_EXIST"));
	}
	await DoctorSpecializationModel.create({ specializationId, doctorId: userId });

	return res.status(StatusCodes.CREATED).json({ message: t("success.DOCTOR_SPECIALIZATION_CREATED") });
};
export const deleteCurrentDoctorSpecialization = async (req: IDoctorRequest, res: Response) => {
	const userId = req.user?.userId;
	if (!userId) {
		throw new BadRequestError(t("errors.DOCTOR_NOT_LOGGED_IN"));
	}
	const isDoctor = await DoctorModel.findOne({ _id: userId });
	if (!isDoctor) {
		throw new NotFoundError(`${t("errors.DOCTOR_NOT_FOUND")} ${userId}`);
	}
	const doctorSpecializations = await DoctorSpecializationModel.findOne({ _id: req.params.id });
	if (!doctorSpecializations) {
		throw new NotFoundError(t("errors.SPECIALIZATIONS_NOT_FOUND"));
	}
	await DoctorSpecializationModel.deleteOne({ _id: req.params.id, doctorId: userId });

	return res.status(StatusCodes.CREATED).json({ message: t("success.DOCTOR_SPECIALIZATION_DELETED") });
};
