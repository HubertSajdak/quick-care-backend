import {Request, Response} from "express";
import {UploadedFile} from "express-fileupload";
import * as fs from "fs";
import {StatusCodes} from "http-status-codes";
import {t} from "i18next";
import path from "path";
import BadRequestError from "../errors/bad-request";
import NotFoundError from "../errors/not-found";
import UnauthenticatedError from "../errors/unauthenticated";
import ClinicModel, {ClinicDocument} from "../models/clinic.model";
import {chunkArray} from "../utils/chunkArray.service";
import {AuthenticatedUserValues} from "./auth.controller";

export interface ClinicProps extends Request {
    user?: {
        userId: string;
        name: string;
        surname: string;
        role: "patient" | "doctor" | "admin";
    };
}

export const getAllClinics = async (req: Request, res: Response) => {
    const {search, sortBy, sortDirection, pageSize, currentPage} = req.query;
    const page = Number(currentPage) || 1;
    const limit = Number(pageSize) || 10;
    const skip = (page - 1) * limit;
    const isAsc = sortDirection === "asc" ? "" : "-";
    let updatedClinics: ClinicDocument[] = [];
    let totalClinics = 0;
    updatedClinics = await ClinicModel.find({});
    if (sortBy === "clinicName") {
        updatedClinics = updatedClinics.sort((a, b) => {
            if (sortDirection === "asc") return a.clinicName.localeCompare(b.clinicName);
            if (sortDirection === "desc") return b.clinicName.localeCompare(a.clinicName);
            return a.clinicName.localeCompare(b.clinicName);
        });
    }
    if (search) {
        updatedClinics = updatedClinics.filter(
            el =>
                el.clinicName.toLowerCase().startsWith(search.toString().toLowerCase()) ||
                el.phoneNumber.toString().startsWith(search.toString().toLowerCase()) ||
                el.address.street.toLowerCase().startsWith(search.toString().toLowerCase()) ||
                el.address.city.toLowerCase().startsWith(search.toString().toLowerCase()) ||
                el.address.postalCode.toLowerCase().startsWith(search.toString().toLowerCase())
        );
    }
    if (!updatedClinics) {
        throw new NotFoundError(t("errors.CLINIC_NOT_FOUND"));
    }
    const numOfPages = Math.ceil(updatedClinics.length / limit);
    const splittedArr = chunkArray(updatedClinics, limit);
    const pageItems = splittedArr[page - 1];
    return res.status(StatusCodes.OK).json({data: pageItems, totalItems: updatedClinics.length, numOfPages});
};
export const getSingleClinic = async (req: Request, res: Response) => {
    const clinicId = req.params.id;
    const clinic = await ClinicModel.findOne({_id: clinicId});
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
    if (user.userId === process.env.DOCTOR_DEMO_ID!.toString()) {
        throw new BadRequestError("errors.DEMO_ACCOUNT_ERROR")
    }
    const {
        clinicName,
        address: {street, postalCode, city},
        phoneNumber,
    } = req.body;
    if (!clinicName || !street || !postalCode || !city || !phoneNumber) {
        throw new BadRequestError(t("errors.BAD_OBJECT_STRUCTURE"));
    }

    const createdClinic = await ClinicModel.create(req.body);
    return res.status(StatusCodes.CREATED).json({message: `${t("success.CLINIC_CREATED")}`, id: createdClinic._id});
};
export const updateClinic = async (req: ClinicProps, res: Response) => {
    const user = req.user
    const clinicId = req.params.id;
    const {
        clinicName,
        address: {street, postalCode, city},
    } = req.body;
    if (user?.userId === process.env.DOCTOR_DEMO_ID!.toString()) {
        throw new BadRequestError("errors.DEMO_ACCOUNT_ERROR")
    }
    if (!clinicId) {
        throw new BadRequestError(t("errors.BAD_OBJECT_STRUCTURE"));
    }
    if (!clinicName || !street || !postalCode || !city) {
        throw new BadRequestError(t("errors.BAD_OBJECT_STRUCTURE"));
    }
    await ClinicModel.updateOne({_id: clinicId}, {...req.body});
    return res.status(StatusCodes.OK).json({message: `${t("success.CLINIC_UPDATED")}`});
};
export const deleteClinic = async (req: ClinicProps, res: Response) => {
    const clinicId = req.params.id;
    const user = req.user
    if (user?.userId === process.env.DOCTOR_DEMO_ID!.toString()) {
        throw new BadRequestError("errors.DEMO_ACCOUNT_ERROR")
    }
    if (!clinicId) {
        throw new BadRequestError(t("errors.BAD_OBJECT_STRUCTURE"));
    }
    const clinic = await ClinicModel.findOne({_id: clinicId});
    if (!clinic) {
        throw new NotFoundError(t("errors.CLINIC_NOT_FOUND"));
    }
    await ClinicModel.deleteOne({_id: clinicId});
    return res.status(StatusCodes.OK).json({message: `${t("success.CLINIC_DELETED")}`});
};

export const uploadClinicPhoto = async (req: AuthenticatedUserValues, res: Response) => {
    const maxSize = 1024 * 1024;
    const {id} = req.params;
    const user = req.user;
    if (!user) {
        throw new UnauthenticatedError("errors.INVALID_AUTHENTICATION");
    }
    const isClinic = await ClinicModel.findOne({_id: id});
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
    await ClinicModel.updateOne({_id: id}, {photo: `uploads/${clinicPhoto.name}`});
    res.status(StatusCodes.OK).json({message: `${t("success.PHOTO_UPDATED")}`});
};

export const deleteClinicPhoto = async (req: AuthenticatedUserValues, res: Response) => {
    const user = req.user;
    if (!user) {
        throw new UnauthenticatedError("errors.INVALID_AUTHENTICATION");
    }
    const {id} = req.params;
    const isClinic = await ClinicModel.findOne({_id: id});
    if (!isClinic) {
        throw new NotFoundError("errors.CLINIC_NOT_FOUND");
    }
    const imagePath = path.join(__dirname, "../public/" + `${isClinic?.photo}`);
    if (!isClinic?.photo) {
        throw new BadRequestError("errors.NO_FILE_TO_REMOVE");
    }
    await ClinicModel.findOneAndUpdate({_id: id}, {photo: null});
    fs.unlink(imagePath, err => {
        if (err) {
            throw new NotFoundError("errors.NO_FILE_TO_REMOVE");
        }
    });

    res.status(StatusCodes.OK).json({message: `${t("success.PHOTO_UPDATED")}`});
};
