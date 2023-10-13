import { t } from "i18next";
import jwt from "jsonwebtoken";

export interface IJWTPayload {
	userId: string;
	name: string;
	surname: string;
	role: "patient" | "doctor" | "admin";
}
export const createJWT = ({ payload }: { payload: IJWTPayload }) => {
	const token = jwt.sign({ ...payload }, process.env.JWT_SECRET!, {
		expiresIn: process.env.JWT_LIFETIME!,
	});
	return token;
};
export const verifyJWT = ({ token }: { token: string }) => {
	return jwt.verify(token, process.env.JWT_SECRET!);
};
export const createRefreshJWT = ({ payload }: { payload: IJWTPayload }) => {
	const token = jwt.sign({ ...payload }, process.env.JWT_REFRESH_SECRET!, {
		expiresIn: process.env.JWT_REFRESH_LIFETIME!,
	});
	return token;
};
export const verifyRefreshJWT = ({ refreshToken }: { refreshToken: string }) => {
	return jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!, (err, decoded) => {
		if (err) {
			return { message: `${t("errors.INVALID_AUTHORIZATION")}` };
		}
		return decoded;
	});
};
