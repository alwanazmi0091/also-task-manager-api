import authenticate from "../middleware/authMiddleware.js";
import validate from "../middleware/zodMiddleware.js";
import express from "express";
import {
  loginController,
  registerController,
  fetchUserController,
  editUserController,
  deleteUserController,
  logoutController,
} from "../controllers/userController.js";
import {
  loginUserSchema,
  registerUserSchema,
  editUserSchema,
} from "../schemas/userSchema.js";

const userRoutes = express.Router();

userRoutes.get("/me", authenticate, fetchUserController);
userRoutes.post("/register", validate(registerUserSchema), registerController);
userRoutes.post("/login", validate(loginUserSchema), loginController);
userRoutes.patch(
  "/",
  authenticate,
  validate(editUserSchema),
  editUserController,
);
userRoutes.delete("/", authenticate, deleteUserController);
userRoutes.post("/logout", authenticate, logoutController);

export default userRoutes;
