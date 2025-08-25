import express from "express";
import { createCategory, deleteCategory, editCategory, getAllCategories } from "../controllers/categoryController";
import authenticate from "../middleware/authenticate";
import validate from "../middleware/validate";
import { categoryEditSchema, categorySchema } from "../schemas/categorySchema";

const categoryRouter = express.Router();

//* GET
categoryRouter.get("/", getAllCategories);

//* POST
categoryRouter.post("/create", authenticate, validate(categorySchema), createCategory);

//* PUT
categoryRouter.put("/edit/:id", authenticate, validate(categoryEditSchema), editCategory);

//* DELETE
categoryRouter.delete("/delete/:id", authenticate, deleteCategory);

export default categoryRouter;
