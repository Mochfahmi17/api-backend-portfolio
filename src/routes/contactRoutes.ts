import express from "express";
import validate from "../middleware/validate";
import { contactSchema } from "../schemas/contactSchema";
import { contactMe } from "../controllers/contactController";

const contactRouter = express.Router();

//* POST
contactRouter.post("/", validate(contactSchema), contactMe);

export default contactRouter;
