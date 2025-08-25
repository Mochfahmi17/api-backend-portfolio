import express from "express";
import { getAllLevels } from "../controllers/levelController";

const levelRouter = express.Router();

//* GET
levelRouter.get("/", getAllLevels);

export default levelRouter;
