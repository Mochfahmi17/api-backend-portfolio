import express from "express";
import { addNewSkill, deleteSkill, editSkill, getAllSkills, getDetailSkill } from "../controllers/skillsController";
import authenticate from "../middleware/authenticate";
import upload from "../middleware/multer";
import validate from "../middleware/validate";
import { skillEditSchema, skillSchema } from "../schemas/skillSchema";

const skillsRouter = express.Router();

//* GET
skillsRouter.get("/", getAllSkills);
skillsRouter.get("/:id", getDetailSkill);

//* POST
skillsRouter.post("/create", authenticate, upload.single("icon"), validate(skillSchema), addNewSkill);

//*PUT
skillsRouter.put("/edit/:id", authenticate, upload.single("icon"), validate(skillEditSchema), editSkill);

//* DELETE
skillsRouter.delete("/delete/:id", authenticate, deleteSkill);

export default skillsRouter;
