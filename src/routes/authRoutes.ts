import express from "express";
import { isAuthenticated, login, logout } from "../controllers/authController";
import validate from "../middleware/validate";
import { loginSchema } from "../schemas/authSchema";
import authenticate from "../middleware/authenticate";

const authRouter = express.Router();

//* GET
authRouter.get("/is-auth", authenticate, isAuthenticated);

//* POST
authRouter.post("/login", validate(loginSchema), login);
authRouter.post("/logout", authenticate, logout);

export default authRouter;
