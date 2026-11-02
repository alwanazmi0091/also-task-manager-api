import express from "express";
import authenticate from "../middleware/authMiddleware.js";
import validate from "../middleware/zodMiddleware.js";
import {
  getTaskById,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";
import {
  taskIdSchema,
  getTaskQuerySchema,
  taskContentSchema,
  updateTaskSchema,
} from "../schemas/taskSchema.js";

const taskRoute = express.Router();

taskRoute.get(
  "/",
  authenticate,
  validate(getTaskQuerySchema, "query"),
  getTasks,
);
taskRoute.get(
  "/:id",
  authenticate,
  validate(taskIdSchema, "params"),
  getTaskById,
);
taskRoute.post("/", authenticate, validate(taskContentSchema), createTask);
taskRoute.patch(
  "/:id",
  authenticate,
  validate(taskIdSchema, "params"),
  validate(updateTaskSchema),
  updateTask,
);
taskRoute.delete(
  "/:id",
  authenticate,
  validate(taskIdSchema, "params"),
  deleteTask,
);

export default taskRoute;
