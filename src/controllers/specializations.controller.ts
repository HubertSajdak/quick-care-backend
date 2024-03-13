import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { t } from "i18next";
import BadRequestError from "../errors/bad-request";
import NotFoundError from "../errors/not-found";
import SpecializationModel, { SpecializationDocument } from "../models/specialization.model";

export const getAllSpecializations = async (req: Request, res: Response) => {
	const specializations = await SpecializationModel.find({});
	if (!specializations) {
		throw new NotFoundError(t("errors.SPECIALIZATIONS_NOT_FOUND"));
	}
	return res.status(StatusCodes.OK).json({ data: specializations, totalItems: specializations.length });
};

export const getSingleSpecialization = async (req: Request, res: Response) => {
	const specializationId = req.params.id;
	const specialization = await SpecializationModel.findOne({ _id: specializationId });
	if (!specialization) {
		throw new NotFoundError(`${t("errors.SPECIALIZATION_NOT_FOUND")} ${specializationId}`);
	}
	return res.status(StatusCodes.OK).json({ data: specialization });
};

export const createSpecialization = async (req: Request<{}, {}, SpecializationDocument>, res: Response) => {
	const { specializationKey } = req.body;
	if (!specializationKey) {
		throw new BadRequestError(t("errors.PROVIDE_SPECIALIZATION_KEY"));
	}
	const specialization = await SpecializationModel.findOne({ specializationKey });
	if (specialization) {
		throw new BadRequestError(t("errors.SPECIALIZATION_EXIST"));
	}
	await SpecializationModel.create({ specializationKey });
	return res.status(StatusCodes.OK).json({ message: t("success.SPECIALIZATION_CREATED") });
};

export const updateSpecialization = (req: Request, res: Response) => {
	return res.send("im wokring");
};

export const deleteSpecialization = (req: Request, res: Response) => {
	return res.send("im wokring");
};
