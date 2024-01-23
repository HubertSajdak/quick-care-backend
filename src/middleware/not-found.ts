import { Request, Response } from "express";

const notFound = (req: Request, res: Response) => {
	res.status(404).send({ message: req.t("errors.ROUTE_DOES_NOT_EXIST") });
};

export default notFound;
