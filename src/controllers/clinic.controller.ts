import { Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import { StatusCodes } from "http-status-codes";
import { t } from "i18next";
import path from "path";
import BadRequestError from "../errors/bad-request";
import NotFoundError from "../errors/not-found";
import UnauthenticatedError from "../errors/unauthenticated";
import ClinicModel, { ClinicDocument } from "../models/clinic.model";
import { AuthenticatedUserValues } from "./auth.controller";

export interface ClinicProps extends Request {
	user?: {
		userId: string;
		name: string;
		surname: string;
		role: "patient" | "doctor" | "admin";
	};
}

export const getAllClinics = async (req: Request, res: Response) => {
	const clinics = await ClinicModel.find({});
	if (!clinics) {
		throw new NotFoundError(t("errors.CLINIC_NOT_FOUND"));
	}
	return res.status(StatusCodes.OK).json({ data: clinics, totalItems: clinics.length });
};
export const getSingleClinic = async (req: Request, res: Response) => {
	const clinicId = req.params.id;
	const clinic = await ClinicModel.findOne({ _id: clinicId });
	if (!clinic) {
		throw new NotFoundError(t("errors.CLINIC_NOT_FOUND"));
	}
	return res.status(StatusCodes.OK).json(clinic);
};
export const createClinic = async (req: ClinicProps, res: Response) => {
	const user = req.user;
	if (!user) {
		throw new UnauthenticatedError("errors.INVALID_AUTHENTICATION");
	}
	const {
		clinicName,
		address: { street, postalCode, city },
		phoneNumber,
	} = req.body;
	if (!clinicName || !street || !postalCode || !city || !phoneNumber) {
		throw new BadRequestError(t("errors.BAD_OBJECT_STRUCTURE"));
	}

	await ClinicModel.create(req.body);
	return res.status(StatusCodes.CREATED).json({ message: `${t("success.CLINIC_CREATED")}` });
};
export const updateClinic = async (req: Request, res: Response) => {
	const clinicId = req.params.id;
	const {
		clinicName,
		address: { street, postalCode, city },
	} = req.body;

	if (!clinicId) {
		throw new BadRequestError(t("errors.BAD_OBJECT_STRUCTURE"));
	}
	if (!clinicName || !street || !postalCode || !city) {
		throw new BadRequestError(t("errors.BAD_OBJECT_STRUCTURE"));
	}
	await ClinicModel.updateOne({ _id: clinicId }, { ...req.body });
	return res.status(StatusCodes.OK).json({ message: `${t("success.CLINIC_UPDATED")}` });
};
export const deleteClinic = async (req: Request, res: Response) => {
	const clinicId = req.params.id;
	if (!clinicId) {
		throw new BadRequestError(t("errors.BAD_OBJECT_STRUCTURE"));
	}
	const clinic = await ClinicModel.findOne({ _id: clinicId });
	if (!clinic) {
		throw new NotFoundError(t("errors.CLINIC_NOT_FOUND"));
	}
	await ClinicModel.deleteOne({ _id: clinicId });
	return res.status(StatusCodes.OK).json({ message: `${t("success.CLINIC_DELETED")}` });
};

export const uploadClinicPhoto = async (req: AuthenticatedUserValues, res: Response) => {
	const maxSize = 1024 * 1024;
	const { id } = req.params;
	const user = req.user;
	if (!user) {
		throw new UnauthenticatedError("errors.INVALID_AUTHENTICATION");
	}
	const isClinic = await ClinicModel.findOne({ _id: id });
	if (!isClinic) {
		throw new NotFoundError(t("errors.CLINIC_NOT_FOUND"));
	}
	if (!req.files || !Object.keys(req.files).length) {
		throw new BadRequestError(t("errors.NO_FILE_UPLOADED"));
	}
	const clinicPhoto = req.files?.file as UploadedFile;
	if (!clinicPhoto.mimetype.startsWith("image")) {
		throw new BadRequestError("Please upload an image file");
	}
	if (clinicPhoto.size > maxSize) {
		throw new BadRequestError("Please upload image smaller than 1mb");
	}
	const imagePath = path.join(__dirname, "../public/uploads/" + `${clinicPhoto.name}`);
	await clinicPhoto.mv(imagePath);
	await ClinicModel.updateOne({ _id: id }, { photo: `uploads/${clinicPhoto.name}` });
	res.status(StatusCodes.OK).json({ message: `${t("success.PHOTO_UPDATED")}` });
};
