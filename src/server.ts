import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import authRouter from "./routes/authRoutes";
import { errorHandler } from "./middleware/errorHandler";
import projectsRouter from "./routes/projectsRoutes";
import skillsRouter from "./routes/skillsRoutes";
import YAML from "yamljs";
import path from "node:path";
import swaggerUi from "swagger-ui-express";
import certificatesRouter from "./routes/certificatesRoutes";
import userRouter from "./routes/userRoutes";
import contactRouter from "./routes/contactRoutes";
import categoryRouter from "./routes/categoryRoutes";
import "dotenv/config";
import levelRouter from "./routes/levelRoutes";

//* YAML file
const document = YAML.load(path.join(__dirname, "../docs/docs.yaml"));

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(cookieParser());
app.use(cors({ origin: process.env.NODE_ENV === "production" ? process.env.CLIENT_URL : "http://localhost:3000", credentials: true }));

//* API Endpoints Start
app.get("/", (req: Request, res: Response) => {
  res.send(`Server is running at http://localhost:${port}`);
});

//* API Endpoints
app.use("/api/auth", authRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/certificates", certificatesRouter);
app.use("/api/skills", skillsRouter);
app.use("/api/user", userRouter);
app.use("/api/contact", contactRouter);
app.use("/api/levels", levelRouter);

//* API document
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(document));

//* Global error Handling
app.use(errorHandler);

app.listen(port, () => {
  console.log(`server up and running at http://localhost:${port}`);
});
