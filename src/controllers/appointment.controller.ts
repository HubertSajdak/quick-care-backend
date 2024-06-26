import {Request, Response} from "express";
import {StatusCodes} from "http-status-codes";
import {t} from "i18next";
import BadRequestError from "../errors/bad-request";
import NotFoundError from "../errors/not-found";
import UnauthenticatedError from "../errors/unauthenticated";
import UnauthorizedError from "../errors/unauthorized";
import AppointmentModel, {AppointmentDocument} from "../models/appointment.model";
import {chunkArray} from "../utils/chunkArray.service";
import {completeAppointment} from "../utils/completeAppointment.service";
import moment from "moment";

export interface IAppointmentRequest extends Request {
    user?: {
        userId: string;
        name: string;
        surname: string;
        role: "patient" | "doctor" | "admin";
    };
}

export const createAppointment = async (req: IAppointmentRequest, res: Response) => {
    const user = req.user;
    if (!user) {
        throw new UnauthenticatedError("errors.INVALID_AUTHENTICATION");
    }
    const {
        doctorId,
        clinicId,
        clinicAffiliationId,
        appointmentDate,
        consultationFee,
        appointmentAddress,
        appointmentStatus,
        timePerPatient,
    } = req.body;
    if (
        !doctorId ||
        !clinicId ||
        !clinicAffiliationId ||
        !appointmentDate ||
        appointmentDate === "Invalid date" ||
        !appointmentAddress ||
        !appointmentStatus ||
        !consultationFee || !timePerPatient
    ) {
        throw new BadRequestError("BAD_OBJECT_STRUCTURE");
    }
    const existingAppointment = await AppointmentModel.findOne({doctorId, appointmentDate});
    if (existingAppointment && existingAppointment.appointmentStatus !== "canceled") {
        throw new BadRequestError(`${t("errors.NO_APPOINTMENT_POSSIBLE")}`);
    }

    await AppointmentModel.create({
        ...req.body,
        patientId: user.userId,
        estimatedEndDate: moment(appointmentDate, "YYYY-MM-DD HH:mm").add(timePerPatient, "minutes").format("YYYY-MM-DD HH:mm")
    })
    res.status(StatusCodes.CREATED).json({message: t("success.APPOINTMENT_CREATED")});
};

export const getDoctorAppointments = async (req: IAppointmentRequest, res: Response) => {
    const doctorId = req.params.id;
    const user = req.user;
    if (!user) {
        throw new UnauthenticatedError("errors.INVALID_AUTHENTICATION");
    }
    if (!doctorId) {
        throw new BadRequestError("errors.BAD_OBJECT_STRUCTURE");
    }
    let doctorAppointments;
    doctorAppointments = doctorAppointments = await AppointmentModel.find({doctorId});
    if (!doctorAppointments) {
        throw new NotFoundError("errors.NO_DOCTOR_APPOINTMENTS_FOUND");
    }
    doctorAppointments = doctorAppointments.filter(appointment => appointment.appointmentStatus === "active")
    res.status(StatusCodes.OK).json({data: doctorAppointments, totalItems: doctorAppointments.length});
};

export const getUserAppointments = async (req: IAppointmentRequest, res: Response) => {
    const user = req.user;
    if (!user) {
        throw new UnauthenticatedError("errors.INVALID_AUTHENTICATION");
    }
    const {search, sortBy, sortDirection, pageSize, currentPage, appointmentFilter} = req.query;
    const page = Number(currentPage) || 1;
    const limit = Number(pageSize) || 10;
    const skip = (page - 1) * limit;
    const isAsc = sortDirection === "asc" ? "" : "-";
    let userAppointments;
    if (user.role === "patient") {
        userAppointments = await AppointmentModel.find({patientId: user.userId});
    }
    if (user.role === "doctor") {
        userAppointments = await AppointmentModel.find({doctorId: user.userId});
    }
    if (!userAppointments) {
        throw new NotFoundError("errors.NO_DOCTOR_APPOINTMENTS_FOUND");
    }

    await completeAppointment(userAppointments);

    let updatedAppointments: AppointmentDocument[] = [];
    let totalAppointments = 0;
    if (user.role === "patient") {
        updatedAppointments = await AppointmentModel.find({patientId: user.userId})
            .select(["-password", "-role"])
            // .skip(skip)
            // .limit(limit)
            .populate({
                path: "doctorInfo clinicInfo",
                select: "name surname photo clinicName phoneNumber",
            });
        totalAppointments = await AppointmentModel.countDocuments({patientId: user.userId});
    }
    if (user.role === "doctor") {
        updatedAppointments = await AppointmentModel.find({doctorId: user.userId}).select(["-password", "-role"]).populate({
            path: "patientInfo clinicInfo",
            select: "name surname photo clinicName phoneNumber",
        });
        // .skip(skip)
        // .limit(limit);
        totalAppointments = await AppointmentModel.countDocuments({doctorId: user.userId});
    }

    if (sortBy === "appointmentDate") {
        updatedAppointments = updatedAppointments.sort((a, b) => {
            const dateA = new Date(a.appointmentDate);
            const dateB = new Date(b.appointmentDate);
            if (sortDirection === "desc") return dateA.getTime() - dateB.getTime();
            if (sortDirection === "asc") return dateB.getTime() - dateA.getTime();
            return dateA.getTime() - dateB.getTime();
        });
    }

    if (sortBy === "clinicName") {
        updatedAppointments = updatedAppointments.sort((a, b) => {
            if (sortDirection === "asc") return a.clinicInfo.clinicName.localeCompare(b.clinicInfo.clinicName);
            if (sortDirection === "desc") return b.clinicInfo.clinicName.localeCompare(a.clinicInfo.clinicName);
            return a.clinicInfo.clinicName.localeCompare(b.clinicInfo.clinicName);
        });
    }
    if (appointmentFilter && appointmentFilter !== "all") {
        updatedAppointments = updatedAppointments.filter(el => el.appointmentStatus === appointmentFilter.toString());
    }

    if (search) {
        updatedAppointments = updatedAppointments.filter(
            el =>
                el.clinicInfo.clinicName.toLowerCase().startsWith(search.toString().toLowerCase()) ||
                el.doctorInfo.name.toLowerCase().startsWith(search.toString().toLowerCase()) ||
                el.doctorInfo.surname.toLowerCase().startsWith(search.toString().toLowerCase()) ||
                el.clinicInfo.phoneNumber.toString().startsWith(search.toString().toLowerCase()) ||
                el.appointmentAddress.street.toLowerCase().startsWith(search.toString().toLowerCase()) ||
                el.appointmentAddress.city.toLowerCase().startsWith(search.toString().toLowerCase()) ||
                el.appointmentAddress.postalCode.toLowerCase().startsWith(search.toString().toLowerCase())
        );
    }
    const numOfPages = Math.ceil(updatedAppointments.length / limit);
    const splittedArr = chunkArray(updatedAppointments, limit);
    const pageItems = splittedArr[page - 1];
    res.status(StatusCodes.OK).json({data: pageItems, totalItems: updatedAppointments.length, numOfPages});
};

export const cancelAppointment = async (req: IAppointmentRequest, res: Response) => {
    const appointmentId = req.params.id;
    const user = req.user;
    if (!user) {
        throw new UnauthenticatedError("errors.INVALID_AUTHENTICATION");
    }

    const appointmentToCancel = await AppointmentModel.findOne({_id: appointmentId});
    if (!appointmentToCancel) {
        throw new NotFoundError(t("error.NO_APPOINTMENT_FOUND"));
    }
    if (
        appointmentToCancel?.doctorId.toString() !== user.userId &&
        appointmentToCancel?.patientId.toString() !== user.userId
    ) {
        throw new UnauthorizedError("errors.NO_ACTION_ALLOWED");
    }
    await AppointmentModel.findOneAndUpdate(
        {_id: appointmentId},
        {
            appointmentStatus: "canceled",
        }
    );
    res.status(StatusCodes.OK).json({message: t("success.APPOINTMENT_CANCELED")});
};
