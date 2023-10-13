import { NextFunction, Request, Response } from "express";
import UnauthenticatedError from "../errors/unauthenticated";
import { t } from "i18next";
import { verifyJWT } from "../utils/jwt";
import UnauthorizedError from "../errors/unauthorized";
import { IJWTPayload } from "../utils/jwt";
export interface IUserPayloadInfo {
	userId: string;
	name: string;
	surname: string;
	role: "patient" | "doctor" | "admin";
}

export interface IGetUserAuthInfo extends Request {
	user?: IUserPayloadInfo;
}
export const authenticateUser = async (req: IGetUserAuthInfo, res: Response, next: NextFunction) => {
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		throw new UnauthenticatedError(t("errors.INVALID_AUTHENTICATION"));
	}
	const token = authHeader.split(" ")[1]; //we are looking for the second item in the arr

	try {
		const { userId, name, surname, role } = verifyJWT({ token: token }) as IJWTPayload;
		req.user = { userId, name, surname, role };
		next();
	} catch (error) {
		throw new UnauthorizedError(t("errors.INVALID_AUTHORIZATION"));
	}
};

export const authorizePermissions = (...roles: string[]) => {
	return (req: any, res: Response, next: NextFunction) => {
		if (!roles.includes(req.user!.role)) {
			throw new UnauthorizedError("errors.INVALID_AUTHORIZATION");
		}
		next();
	};
};
