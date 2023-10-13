import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { t } from "i18next";
import BadRequestError from "../errors/bad-request";
import UnauthenticatedError from "../errors/unauthenticated";
import PatientModel from "../models/patient.model";
import { PatientDocument } from "../models/patient.model";
import { createJWT, createRefreshJWT } from "../utils/jwt";
import jwt from "jsonwebtoken";
import NotFoundError from "../errors/not-found";

export const register = async (req: Request<{}, {}, PatientDocument>, res: Response) => {
	const { name, surname, email, password, address, phoneNumber } = req.body;
	const isPatient = await PatientModel.findOne({ email });
	if (isPatient) {
		throw new BadRequestError(t("errors.EMAIL_EXIST"));
	}
	if (!name || !surname || !email || !password || !address || !phoneNumber) {
		throw new BadRequestError(t("errors.INVALID_CREDENTIALS"));
	}
	await PatientModel.create({ ...req.body });

	res.status(StatusCodes.CREATED).json({ message: t("success.USER_CREATED") });
};
export const login = async (req: Request<{}, {}, PatientDocument>, res: Response) => {
	const { email, password } = req.body;
	if (!email || !password) {
		throw new BadRequestError(t("errors.PROVIDE_EMAIL_AND_PASSWORD"));
	}
	const patient = await PatientModel.findOne({ email });
	if (!patient) {
		throw new UnauthenticatedError(t("errors.INVALID_CREDENTIALS"));
	}
	const isPasswordCorrect = await patient.comparePassword(password);
	if (!isPasswordCorrect) {
		throw new UnauthenticatedError("errors.INVALID_CEREDENTIALS");
	}
	const token = createJWT({
		payload: { userId: patient._id, name: patient.name, surname: patient.surname, role: patient.role },
	});
	const refreshToken = createRefreshJWT({
		payload: { userId: patient._id, name: patient.name, surname: patient.surname, role: patient.role },
	});
	res.status(StatusCodes.OK).json({ message: `${t("success.USER_LOGIN")} ${patient.name}`, token, refreshToken });
};

export const logout = (req: Request, res: Response) => {
	res.status(StatusCodes.OK).json({ message: t("success.USER_LOGOUT") });
};

export const refreshToken = (req: Request<{}, {}, { refreshToken: string }>, res: Response) => {
	const { refreshToken } = req.body;

	if (refreshToken) {
		jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!, (err: jwt.VerifyErrors | null, decoded: any) => {
			//elaborate on these errors later and remove any from decoded :)
			if (err) {
				return res.status(StatusCodes.NOT_ACCEPTABLE).json({ message: `${t("errors.REFRESH_TOKEN_EXP")}` });
			}
			const accessToken = createJWT({
				payload: {
					userId: decoded.userId,
					name: decoded.name,
					surname: decoded.surname,
					role: decoded.role,
				},
			});
			return res.status(StatusCodes.OK).json({ accessToken });
		});
	} else {
		return res.status(StatusCodes.BAD_REQUEST).json({ message: `${t("errors.INVALID_AUTHORIZATION")}` });
	}
};

export const getAllPatients = async (req: Request, res: Response) => {
	const { search, sortBy, sortDirection, pageSize, currentPage } = req.query;
	const page = Number(currentPage) || 1;
	const limit = Number(pageSize) || 10;
	const skip = (page - 1) * limit;
	const isAsc = sortDirection === "asc" ? "" : "-";
	let patients = await PatientModel.find({})
		.select(["-password", "-role"])
		.sort(isAsc + `${sortBy}`)
		.skip(skip)
		.limit(limit);
	if (!patients) {
		throw new NotFoundError(t("errors.DOCTORS_NOT_FOUND"));
	}
	const totalPatients = await PatientModel.countDocuments();
	const numOfPages = Math.ceil(totalPatients / limit);
	return res.status(StatusCodes.OK).json({ data: patients, totalItems: totalPatients, numOfPages });
};
export const getSinglePatient = (req: Request, res: Response) => {};
