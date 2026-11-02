import Task from "../models/Task.js";

class TaskService {
  static async get(userId, filters) {
    const result = await Task.get(userId, filters);
    return result;
  }

  static async getById(userId, taskId) {
    const result = await Task.getById(taskId, userId);
    if (!result) {
      const error = new Error("Task not found");
      error.statusCode = 404;
      throw error;
    }
    return result;
  }

  static async create(userId, task) {
    const result = await Task.create(task, userId);
    return result;
  }

  static async update(userId, taskId, fields) {
    const result = await Task.update(taskId, userId, fields);
    if (!result) {
      const error = new Error("Task not found");
      error.statusCode = 404;
      throw error;
    }
  }

  static async delete(userId, taskId) {
    const result = await Task.delete(taskId, userId);
    if (!result) {
      const error = new Error("Task not found");
      error.statusCode = 404;
      throw error;
    }
  }
}

export default TaskService;
