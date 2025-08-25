import express from "express";
import { addNewCertificate, deleteCertificate, editCertificate, getAllCertificates, getDetailCertificate } from "../controllers/certificateController";
import authenticate from "../middleware/authenticate";
import upload from "../middleware/multer";
import validate from "../middleware/validate";
import { certificateEditSchema, certificateSchema } from "../schemas/certificateSchema";

const certificatesRouter = express.Router();

//* GET
certificatesRouter.get("/", getAllCertificates);
certificatesRouter.get("/:id", getDetailCertificate);

//* POST
certificatesRouter.post("/create", authenticate, upload.single("certificateImage"), validate(certificateSchema), addNewCertificate);

//* PUT
certificatesRouter.put("/edit/:id", authenticate, upload.single("certificateImage"), validate(certificateEditSchema), editCertificate);

//* DELETE
certificatesRouter.delete("/delete/:id", authenticate, deleteCertificate);

export default certificatesRouter;
