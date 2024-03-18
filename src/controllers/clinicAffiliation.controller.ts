import {Request, Response} from "express";
import {StatusCodes} from "http-status-codes";
import {t} from "i18next";
import BadRequestError from "../errors/bad-request";
import NotFoundError from "../errors/not-found";
import UnauthenticatedError from "../errors/unauthenticated";
import ClinicAffiliationModel from "../models/clinicAffiliation.model";

export interface IClinicAffiliationRequest extends Request {
    user?: {
        userId: string;
        name: string;
        surname: string;
        role: "patient" | "doctor" | "admin";
    };
}

export const getAllClinicAffiliations = async (req: Request, res: Response) => {
    const clinicAffiliations = await ClinicAffiliationModel.find({});
    if (!clinicAffiliations) {
        throw new NotFoundError(t("errors.CLINIC_AFFILIATION_NOT_FOUND"));
    }
    res.status(StatusCodes.OK).json({data: clinicAffiliations, totalItems: clinicAffiliations.length});
};
export const getCurrentUserClinicAffiliations = async (req: IClinicAffiliationRequest, res: Response) => {
    const user = req.user;
    if (!user) {
        throw new UnauthenticatedError("errors.INVALID_AUTHENTICATION");
    }
    const clinicAffiliations = await ClinicAffiliationModel.find({doctorId: user.userId}).populate({
        path: "clinicInfo",
        select: "workingTime address phoneNumber photo",
    });
    if (!clinicAffiliations) {
        throw new NotFoundError(t("errors.CLINIC_AFFILIATION_NOT_FOUND"));
    }
    res.status(StatusCodes.OK).json({data: clinicAffiliations, totalItems: clinicAffiliations.length});
};
export const getDoctorClinicAffiliations = async (req: Request, res: Response) => {
    const doctorId = req.params.id;
    const clinicAffiliations = await ClinicAffiliationModel.find({doctorId: doctorId}).populate({
        path: "clinicInfo",
        select: "workingTime address phoneNumber",
    });
    if (!clinicAffiliations) {
        throw new NotFoundError(t("errors.CLINIC_AFFILIATION_NOT_FOUND"));
    }

    res.status(StatusCodes.OK).json(clinicAffiliations);
};
export const getSingleClinicAffiliation = async (req: Request, res: Response) => {
    const clinicAffiliationId = req.params.id;
    const clinicAffiliation = await ClinicAffiliationModel.findOne({_id: clinicAffiliationId});
    if (!clinicAffiliation) {
        throw new NotFoundError(t("errors.CLINIC_AFFILIATION_NOT_FOUND"));
    }
    res.status(StatusCodes.OK).json(clinicAffiliation);
};
export const createCurrentDoctorClinicAffiliation = async (req: IClinicAffiliationRequest, res: Response) => {
    const user = req.user;
    if (!user) {
        throw new UnauthenticatedError("errors.INVALID_AUTHENTICATION");
    }
    if (user?.userId === process.env.DOCTOR_DEMO_ID!.toString()) {
        throw new BadRequestError("errors.DEMO_ACCOUNT_ERROR")
    }
    const {
        clinicName,
        clinicId,
        workingTime,
        available,
        reasonOfAbsence,
        absenceTime,
        consultationFee,
        timePerPatient,
    } = req.body;

    if (!clinicName || !clinicId || !workingTime || !consultationFee || !timePerPatient) {
        throw new BadRequestError(t("errors.BAD_OBJECT_STRUCTURE"));
    }
    const isClinicAffiliation = await ClinicAffiliationModel.findOne({clinicId, doctorId: user.userId});
    if (isClinicAffiliation) {
        throw new BadRequestError(t("errors.CLINIC_AFFILIATION_ALREADY_EXISTS"));
    }
    await ClinicAffiliationModel.create({doctorId: user.userId, ...req.body});
    res.status(StatusCodes.OK).json({message: t("success.DOCTOR_CLINIC_AFFILIATION_CREATED")});
};
export const updateClinicAffiliation = async (req: IClinicAffiliationRequest, res: Response) => {
    const user = req.user;

    const clinicAffiliationId = req.params.id;

    if (!user) {
        throw new UnauthenticatedError("errors.INVALID_AUTHENTICATION");
    }
    if (user?.userId === process.env.DOCTOR_DEMO_ID!.toString()) {
        throw new BadRequestError("errors.DEMO_ACCOUNT_ERROR")
    }
    const {clinicName, clinicId, workingTime, available, consultationFee, timePerPatient} = req.body;
    if (!clinicName || !clinicId || !workingTime || !available || !consultationFee || !timePerPatient) {
        throw new BadRequestError(t("errors.BAD_OBJECT_STRUCTURE"));
    }
    await ClinicAffiliationModel.updateOne({_id: clinicAffiliationId}, {doctorId: user.userId, ...req.body});
    res.status(StatusCodes.OK).json({message: t("success.DOCTOR_CLINIC_AFFILIATION_UPDATED")});
};
export const deleteClinicAffiliation = async (req: IClinicAffiliationRequest, res: Response) => {
    const clinicAffiliationId = req.params.id;
    const user = req.user;
    if (!user) {
        throw new UnauthenticatedError("errors.INVALID_AUTHENTICATION");
    }
    if (user?.userId === process.env.DOCTOR_DEMO_ID!.toString()) {
        throw new BadRequestError("errors.DEMO_ACCOUNT_ERROR")
    }
    const clinicAffiliation = await ClinicAffiliationModel.findOne({_id: clinicAffiliationId});
    if (!clinicAffiliation) {
        throw new NotFoundError(t("errors.CLINIC_AFFILIATION_NOT_FOUND"));
    }
    await ClinicAffiliationModel.deleteOne({_id: clinicAffiliationId});
    res.status(StatusCodes.OK).json({message: t("success.DOCTOR_CLINIC_AFFILIATION_DELETED")});
};
