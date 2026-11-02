import TaskService from "../services/TaskService.js";

const getTaskById = async (req, res) => {
  const userId = req.session.userId;
  const taskId = req.validatedParams.id;

  const result = await TaskService.getById(userId, taskId);
  return res.status(200).json(result);
};

const getTasks = async (req, res) => {
  const filters = { ...req.validatedQuery };
  const userId = req.session.userId;

  const result = await TaskService.get(userId, filters);
  return res.status(200).json(result);
};

const createTask = async (req, res) => {
  const userId = req.session.userId;
  const task = req.body.task;

  const result = await TaskService.create(userId, task);

  return res.status(201).json({
    message: "Task created successfully",
    insertId: result,
  });
};

const updateTask = async (req, res) => {
  const userId = req.session.userId;
  const taskId = req.validatedParams.id;
  const fields = { ...req.body };

  await TaskService.update(userId, taskId, fields);
  return res.status(204).send();
};

const deleteTask = async (req, res) => {
  const userId = req.session.userId;
  const taskId = req.validatedParams.id;

  await TaskService.delete(userId, taskId);
  return res.status(204).send();
};

export { getTaskById, getTasks, createTask, updateTask, deleteTask };
