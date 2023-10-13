import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
const errorHandlerMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
	let customError = {
		// set default
		statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
		message: err.message || req.t("errors.SOMETHING_WENT_WRONG"),
	};
	if (err.name === "ValidationError") {
		customError.message = Object.values(err.errors)
			.map((item: any) => item.message)
			.join(",");
		customError.statusCode = 400;
	}
	if (err.code && err.code === 11000) {
		customError.message = `${req.t("errors.DUPLICATE_VALUE")} ${Object.keys(err.keyValue)}`;
		customError.statusCode = 400;
	}
	if (err.name === "CastError") {
		customError.message = `${req.t("errors.NO_ITEM_FOUND_WITH_ID")} ${err.value}`;
		customError.statusCode = 404;
	}

	return res.status(customError.statusCode).json({ message: customError.message });
};

export default errorHandlerMiddleware;
