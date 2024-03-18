import {Request, Response} from "express";
import {StatusCodes} from "http-status-codes";
import {t} from "i18next";
import jwt from "jsonwebtoken";
import BadRequestError from "../errors/bad-request";
import NotFoundError from "../errors/not-found";
import UnauthenticatedError from "../errors/unauthenticated";
import DoctorModel from "../models/doctor.model";
import {createJWT, createRefreshJWT} from "../utils/jwt";

export const register = async (req: Request, res: Response) => {
    const {name, surname, email, password} = req.body;
    const isUser = await DoctorModel.findOne({email});
    if (isUser) {
        throw new BadRequestError(t("errors.EMAIL_EXIST"));
    }
    if (!name || !surname || !email || !password) {
        throw new BadRequestError(t("errors.INVALID_CREDENTIALS"));
    }
    const user = await DoctorModel.create({...req.body});

    res.status(StatusCodes.CREATED).json({message: t("success.USER_CREATED")});
};
export const login = async (req: Request, res: Response) => {
    const {email, password} = req.body;
    if (!email || !password) {
        throw new BadRequestError(t("errors.PROVIDE_EMAIL_AND_PASSWORD"));
    }
    const user = await DoctorModel.findOne({email});
    if (!user) {
        throw new UnauthenticatedError(t("errors.INVALID_CREDENTIALS"));
    }
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
        throw new UnauthenticatedError("errors.INVALID_CEREDENTIALS");
    }
    const token = createJWT({payload: {userId: user._id, name: user.name, surname: user.surname, role: user.role}});
    const refreshToken = createRefreshJWT({
        payload: {userId: user._id, name: user.name, surname: user.surname, role: user.role},
    });
    res.status(StatusCodes.OK).json({message: `${t("success.USER_LOGIN")} ${user.name}`, token, refreshToken});
};

export const logout = (req: Request, res: Response) => {
    res.status(StatusCodes.OK).json({message: t("success.USER_LOGOUT")});
};

export const refreshToken = (req: Request, res: Response) => {
    const {refreshToken} = req.body;

    if (refreshToken) {
        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!, (err: jwt.VerifyErrors | null, decoded: any) => {
            //elaborate on these errors later and remove any from decoded :)
            if (err) {
                return res.status(StatusCodes.NOT_ACCEPTABLE).json({message: `${t("errors.REFRESH_TOKEN_EXP")}`});
            }
            const accessToken = createJWT({
                payload: {
                    userId: decoded.userId,
                    name: decoded.name,
                    surname: decoded.surname,
                    role: decoded.role,
                },
            });
            return res.status(StatusCodes.OK).json({accessToken});
        });
    } else {
        return res.status(StatusCodes.BAD_REQUEST).json({message: `${t("errors.INVALID_AUTHORIZATION")}`});
    }
};

//AVAILABLE ONLY BY CURRENTLY LOGGED IN DOCTOR
export const updateSelfDoctor = (req: Request, res: Response) => {
};
export const deleteSelfDoctor = (req: Request, res: Response) => {
};

export const getAllDoctors = async (req: Request, res: Response) => {
    const {search, sortBy, sortDirection, pageSize, currentPage, querySpecializations} = req.query;
    console.log(querySpecializations);
    const page = Number(currentPage) || 1;
    const limit = Number(pageSize) || 10;
    const skip = (page - 1) * limit;
    const isAsc = sortDirection === "asc" ? "" : "-";
    const selectedSpecsArr = String(querySpecializations)?.split("_");
    let doctors = await DoctorModel.find(
        search
            ? {
                $expr: {
                    $regexMatch: {
                        input: {$concat: ["$name", " ", "$surname"]},
                        regex: search,
                        options: "i",
                    },
                },
            }
            : {}
    )
        .select(["-password", "-role"])
        .populate({
            path: "DoctorSpecialization",
            populate: {
                path: "Specialization",
            },
        })
        .populate({
            path: "ClinicAffiliation",
            populate: {
                path: "clinicInfo",
            },
        })
        .sort(isAsc + `${sortBy}`)
        .skip(skip)
        .limit(limit);

    if (!doctors) {
        throw new NotFoundError(t("errors.DOCTORS_NOT_FOUND"));
    }
    const totalDoctors = await DoctorModel.countDocuments(
        search
            ? {
                $expr: {
                    $regexMatch: {
                        input: {$concat: ["$name", " ", "$surname"]},
                        regex: search,
                        options: "i",
                    },
                },
            }
            : {}
    );

    const numOfPages = Math.ceil(totalDoctors / limit);
    return res.status(StatusCodes.OK).json({data: doctors, totalItems: totalDoctors, numOfPages});
};
export const getSingleDoctor = async (req: Request, res: Response) => {
    const doctorId = req.params.id;
    const doctor = await DoctorModel.findOne({_id: doctorId})
        .select("-password")
        .populate({
            path: "DoctorSpecialization",
            populate: {
                path: "Specialization",
                select: "specializationKey",
            },
        })
        .populate({
            path: "ClinicAffiliation",
            populate: {
                path: "clinicInfo",
            },
        });
    if (!doctor) {
        throw new NotFoundError(t("errors.DOCTOR_NOT_FOUND"));
    }
    return res.status(StatusCodes.OK).json({doctor});
};
//ADMIN
export const updateDoctor = (req: Request, res: Response) => {
};
export const createDoctor = (req: Request, res: Response) => {
};
export const deleteDoctor = (req: Request, res: Response) => {
};
