import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import i18next from "i18next";
import Backend from "i18next-fs-backend";
import i18nMiddleware from "i18next-http-middleware";
import errorHandlerMiddleware from "./middleware/error-handler";
import notFoundMiddleware from "./middleware/not-found";
import "express-async-errors";
import { connectDB } from "./db/connect";
import morgan from "morgan";
import authRouter from "./routes/auth.routes";
import patientRouter from "./routes/patient.routes";
import doctorRouter from "./routes/doctor.routes";
import specializationRouter from "./routes/specialization.routes";
import doctorSpecializationsRouter from "./routes/doctorSpecializations.routes";
import clinicAffiliationRouter from "./routes/clinicAffiliation.routes";
import clinicRouter from "./routes/clinic.routes";
import appointmentRouter from "./routes/appointment.routes";
import fileUpload from "express-fileupload";
import cors from "cors";
import path from "path";
const port = process.env.PORT || 5000;

i18next
	.use(Backend)
	.use(i18nMiddleware.LanguageDetector)
	.init({ fallbackLng: "en", backend: { loadPath: "./locales/{{lng}}/translation.json" } });

dotenv.config();
const app: Express = express();
app.use(express.json());

app.use(morgan("tiny"));
app.use(cors());
app.use("/api/v1", express.static(__dirname + "/public"));
app.use(fileUpload());
//database
app.use(i18nMiddleware.handle(i18next));
//to get access to json data in req.body
app.get("/", (req: Request, res: Response) => {
	res.send("Patients-Care-API");
});
//routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/doctors", doctorRouter);
app.use("/api/v1/patients", patientRouter);
app.use("/api/v1/specializations", specializationRouter);
app.use("/api/v1/doctorSpecializations", doctorSpecializationsRouter);
app.use("/api/v1/clinicAffiliations", clinicAffiliationRouter);
app.use("/api/v1/clinics", clinicRouter);
app.use("/api/v1/appointments", appointmentRouter);
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const start = async () => {
	try {
		await connectDB(process.env.MONGO_URI!);
		app.listen(port, () => {
			console.log(`🚀 Now listening on port ${port}...`);
		});
	} catch (error) {
		console.log(error);
	}
};
start();
