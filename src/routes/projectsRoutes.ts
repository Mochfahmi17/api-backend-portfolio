import express from "express";
import { createProject, deleteProject, editProject, getAllProject, getDetailProject } from "../controllers/projectsController";
import authenticate from "../middleware/authenticate";
import validate from "../middleware/validate";
import { projectEditSchema, projectSchema } from "../schemas/projectSchema";
import upload from "../middleware/multer";

const projectsRouter = express.Router();

//* GET
projectsRouter.get("/", getAllProject);
projectsRouter.get("/:slug", getDetailProject);

//* POST
projectsRouter.post("/create", authenticate, upload.single("image"), validate(projectSchema), createProject);

//* PUT
projectsRouter.put("/edit/:slug", authenticate, upload.single("image"), validate(projectEditSchema), editProject);

//* DELETE
projectsRouter.delete("/delete/:slug", authenticate, deleteProject);

export default projectsRouter;
