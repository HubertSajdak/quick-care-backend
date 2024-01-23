import { Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import { StatusCodes } from "http-status-codes";
import { t } from "i18next";
import jwt from "jsonwebtoken";
import path from "path";
import BadRequestError from "../errors/bad-request";
import UnauthenticatedError from "../errors/unauthenticated";
import { DoctorDocument, default as DoctorModel, default as UserModel } from "../models/doctor.model";
import PatientModel from "../models/patient.model";
import { createJWT, createRefreshJWT } from "../utils/jwt";
import * as fs from "fs";
import NotFoundError from "../errors/not-found";
export interface AuthenticatedUserValues extends Request {
	user?: {
		userId: string;
		name: string;
		surname: string;
		role: "patient" | "doctor" | "admin";
	};
}

export const register = async (req: Request<{}, {}, DoctorDocument>, res: Response) => {
	const { name, surname, email, password, role } = req.body;
	const isUser = await UserModel.findOne({ email });
	if (isUser) {
		throw new BadRequestError("errors.EMAIL_EXIST");
	}
	if (!name || !surname || !email || !password) {
		throw new BadRequestError("errors.PROVIDE_REGISTER_VALUES");
	}
	const user = await UserModel.create({ ...req.body });

	res.status(StatusCodes.CREATED).json({ message: t("success.USER_CREATED") });
};

export const login = async (req: Request<{}, {}, DoctorDocument>, res: Response) => {
	const { email, password } = req.body;
	if (!email || !password) {
		throw new BadRequestError("errors.PROVIDE_EMAIL_AND_PASSWORD");
	}

	const isDoctor = await DoctorModel.findOne({ email });
	const isPatient = await PatientModel.findOne({ email });
	if (!isDoctor && !isPatient) {
		throw new UnauthenticatedError("errors.INVALID_CREDENTIALS");
	}
	if (isDoctor) {
		const isPasswordCorrect = await isDoctor.comparePassword(password);
		if (!isPasswordCorrect) {
			throw new UnauthenticatedError("errors.INVALID_CREDENTIALS");
		}
		const accessToken = createJWT({
			payload: { userId: isDoctor._id, name: isDoctor.name, surname: isDoctor.surname, role: isDoctor.role },
		});
		const refreshToken = createRefreshJWT({
			payload: { userId: isDoctor._id, name: isDoctor.name, surname: isDoctor.surname, role: isDoctor.role },
		});
		res.status(StatusCodes.OK).json({ message: `${t("success.USER_LOGIN")}`, accessToken, refreshToken });
	} else if (isPatient) {
		const isPasswordCorrect = await isPatient.comparePassword(password);
		if (!isPasswordCorrect) {
			throw new UnauthenticatedError("errors.INVALID_CREDENTIALS");
		}
		const accessToken = createJWT({
			payload: { userId: isPatient._id, name: isPatient.name, surname: isPatient.surname, role: isPatient.role },
		});
		const refreshToken = createRefreshJWT({
			payload: { userId: isPatient._id, name: isPatient.name, surname: isPatient.surname, role: isPatient.role },
		});
		res.status(StatusCodes.OK).json({ message: t("success.USER_LOGIN"), accessToken, refreshToken });
	}
};
export const getUserData = async (req: AuthenticatedUserValues, res: Response) => {
	const user = req.user;
	if (!user) {
		throw new UnauthenticatedError("errors.INVALID_AUTHENTICATION");
	}
	const isDoctor = await DoctorModel.findOne({ _id: user.userId }).select("-password").populate("DoctorSpecialization");
	const isPatient = await PatientModel.findOne({ _id: user.userId }).select("-password");
	if (!isDoctor && !isPatient) {
		throw new UnauthenticatedError("errors.REFRESH_TOKEN_EXP");
	}
	if (isDoctor) {
		const { _id, name, surname, email, photo, professionalStatement, role, DoctorSpecialization } = isDoctor;
		return res
			.status(StatusCodes.OK)
			.json({ _id, name, surname, email, photo, professionalStatement, role, DoctorSpecialization });
	}
	if (isPatient) {
		const { _id, address, name, surname, phoneNumber, email, photo, role } = isPatient;

		return res.status(StatusCodes.OK).json({ _id, address, name, surname, phoneNumber, email, photo, role });
	}
};
export const logout = (req: Request, res: Response) => {
	res.status(StatusCodes.OK).json({ message: t("success.USER_LOGOUT") });
};

export const refreshToken = (req: Request, res: Response) => {
	const { refreshToken } = req.body;

	if (refreshToken) {
		jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!, (err: jwt.VerifyErrors | null, decoded: any) => {
			//elaborate on these errors later and remove any from decoded :)
			if (err) {
				return res.status(StatusCodes.UNAUTHORIZED).json({ message: `${t("errors.REFRESH_TOKEN_EXP")}` });
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
export const updateUserInfo = async (req: AuthenticatedUserValues, res: Response) => {
	const user = req.user;
	if (!user) {
		throw new UnauthenticatedError("errors.INVALID_AUTHENTICATION");
	}
	const isDoctor = await DoctorModel.findOne({ _id: user.userId }).select("-password");
	const isPatient = await PatientModel.findOne({ _id: user.userId }).select("-password");
	if (!isDoctor && !isPatient) {
		throw new UnauthenticatedError("errors.REFRESH_TOKEN_EXP");
	}
	if (isDoctor) {
		const { name, surname, email } = req.body;
		if (!name || !surname || !email) {
			throw new BadRequestError("errors.BAD_OBJECT_STRUCTURE");
		}
		await DoctorModel.updateOne({ _id: user.userId }, { ...req.body });
		return res.status(StatusCodes.OK).json({ message: `${t("success.USER_UPDATED")}` });
	}
	if (isPatient) {
		const { name, surname, email, phoneNumber, address } = req.body;
		if (!name || !surname || !email || !phoneNumber || !address) {
			throw new BadRequestError("errors.BAD_OBJECT_STRUCTURE");
		}
		await PatientModel.updateOne({ _id: user.userId }, { ...req.body });
		return res.status(StatusCodes.OK).json({ message: `${t("success.USER_UPDATED")}` });
	}
};

export const updateUserPassword = async (req: AuthenticatedUserValues, res: Response) => {
	const { password, confirmPassword } = req.body;
	const user = req.user;
	if (!user) {
		throw new UnauthenticatedError("errors.INVALID_AUTHENTICATION");
	}
	const isDoctor = await DoctorModel.findOne({ _id: user.userId }).select("-password");
	const isPatient = await PatientModel.findOne({ _id: user.userId }).select("-password");
	if (!isDoctor && !isPatient) {
		throw new UnauthenticatedError("errors.REFRESH_TOKEN_EXP");
	}
	if (password !== confirmPassword) {
		throw new BadRequestError("errors.PASSWORDS_MUST_MATCH");
	}
	if (isDoctor) {
		isDoctor.password = password;
		await isDoctor.save();
		return res.status(StatusCodes.OK).json({ message: `${t("success.USER_UPDATED")}` });
	}
	if (isPatient) {
		isPatient.password = password;
		await isPatient.save();
		return res.status(StatusCodes.OK).json({ message: `${t("success.USER_UPDATED")}` });
	}
};

export const uploadPhoto = async (req: AuthenticatedUserValues, res: Response) => {
	const maxSize = 1024 * 1024;

	const user = req.user;
	if (!user) {
		throw new UnauthenticatedError("errors.INVALID_AUTHENTICATION");
	}
	const isDoctor = await DoctorModel.findOne({ _id: user.userId }).select("-password");
	const isPatient = await PatientModel.findOne({ _id: user.userId }).select("-password");
	if (!req.files || !Object.keys(req.files).length) {
		throw new BadRequestError(t("errors.NO_FILE_UPLOADED"));
	}
	const userPhoto = req.files?.file as UploadedFile;
	if (!userPhoto.mimetype.startsWith("image")) {
		throw new BadRequestError("errors.BAD_FORMAT");
	}
	if (userPhoto.size > maxSize) {
		throw new BadRequestError(t("errors.TOO_LARGE_FILE_SIZE"));
	}
	const imagePath = path.join(__dirname, "../public/uploads/" + `${userPhoto.name}`);
	await userPhoto.mv(imagePath);
	if (!isDoctor && !isPatient) {
		throw new UnauthenticatedError("errors.REFRESH_TOKEN_EXP");
	}
	if (isDoctor) {
		await DoctorModel.updateOne({ _id: user.userId }, { photo: `uploads/${userPhoto.name}` });
		res.status(StatusCodes.OK).json({ message: `${t("success.PHOTO_UPDATED")}` });
	}
	if (isPatient) {
		await PatientModel.updateOne({ _id: user.userId }, { photo: `uploads/${userPhoto.name}` });
		res.status(StatusCodes.OK).json({ message: `${t("success.PHOTO_UPDATED")}` });
	}
};

export const removePhoto = async (req: AuthenticatedUserValues, res: Response) => {
	const user = req.user;
	if (!user) {
		throw new UnauthenticatedError("errors.INVALID_AUTHENTICATION");
	}
	const isDoctor = await DoctorModel.findOne({ _id: user.userId }).select("-password");
	const isPatient = await PatientModel.findOne({ _id: user.userId }).select("-password");
	if (!isDoctor && !isPatient) {
		throw new UnauthenticatedError("errors.REFRESH_TOKEN_EXP");
	}
	if (!isDoctor?.photo && !isPatient?.photo) {
		throw new BadRequestError("errors.NO_FILE_TO_REMOVE");
	}
	const imagePath = path.join(__dirname, "../public/" + `${isDoctor?.photo || isPatient?.photo}`);
	if (isDoctor) {
		await DoctorModel.findOneAndUpdate({ _id: user.userId }, { photo: null });
	}
	if (isPatient) {
		await PatientModel.findOneAndUpdate({ _id: user.userId }, { photo: null });
	}
	fs.unlink(imagePath,(err)=>{
		if(err){
			throw new NotFoundError("errors.NO_FILE_TO_REMOVE");
		}
	})

	res.status(StatusCodes.OK).json({ message: `${t("success.PHOTO_UPDATED")}` });
};
