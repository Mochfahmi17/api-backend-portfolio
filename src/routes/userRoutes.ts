import express from "express";
import authenticate from "../middleware/authenticate";
import upload from "../middleware/multer";
import { editProfile, getDetailUser, user } from "../controllers/userController";
import validate from "../middleware/validate";
import { editUserSchema } from "../schemas/editUserSchema";

const userRouter = express.Router();

//* GET
userRouter.get("/", user);
userRouter.get("/:id", getDetailUser);

//* PUT
userRouter.put(
  "/edit",
  authenticate,
  upload.fields([
    { name: "profile", maxCount: 1 },
    { name: "cv", maxCount: 1 },
  ]),
  validate(editUserSchema),
  editProfile
);

export default userRouter;
