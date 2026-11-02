import pool from "../config/db.js";

class Task {
  static async getById(taskId, userId) {
    const [result] = await pool.execute(
      `
        SELECT task_id, task_content, is_completed
        FROM tasks
        WHERE task_id = ? AND user_id = UUID_TO_BIN(?)
      `,
      [taskId, userId],
    );

    if (result.length === 0) {
      return null;
    }

    return {
      ...result[0],
      is_completed: Boolean(result[0].is_completed),
    };
  }

  static async get(userId, filters) {
    const { search, isCompleted, page, limit, sortBy, sortOrder } = filters;

    const conditions = ["user_id = UUID_TO_BIN(?)"];
    const params = [userId];

    if (search !== undefined) {
      conditions.push("task_content LIKE ?");
      params.push(`%${search}%`);
    }

    if (isCompleted !== undefined) {
      conditions.push("is_completed = ?");
      params.push(isCompleted);
    }

    const whereClause = conditions.join(" AND ");

    const [rowsCount] = await pool.execute(
      `
        SELECT COUNT(*) AS total 
        FROM tasks
        WHERE ${whereClause}
      `,
      params,
    );

    const total = Number(rowsCount[0].total);
    const offset = (page - 1) * limit;

    const [rows] = await pool.execute(
      `
        SELECT task_id, task_content, is_completed
        FROM tasks
        WHERE ${whereClause}
        ORDER BY ${sortBy} ${sortOrder}
        LIMIT ? OFFSET ?
      `,
      [...params, limit, offset],
    );

    return {
      pagination: {
        page,
        limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
      },
      tasks: rows.map((task) => ({
        ...task,
        is_completed: Boolean(task.is_completed),
      })),
    };
  }

  static async create(task, userId) {
    const [result] = await pool.execute(
      `
        INSERT INTO tasks (task_content, user_id)
        VALUES (?, UUID_TO_BIN(?))
      `,
      [task, userId],
    );

    return result.insertId;
  }

  static async update(taskId, userId, fields) {
    const fieldNames = {
      taskContent: "task_content",
      isCompleted: "is_completed",
    };

    const keys = Object.keys(fields).map((key) => fieldNames[key]);
    const values = Object.values(fields);
    const setClause = keys.map((key) => `${key} = ?`).join(", ");
    values.push(taskId, userId);

    const [result] = await pool.execute(
      `
        UPDATE tasks
        SET ${setClause}
        WHERE task_id = ? AND user_id = UUID_TO_BIN(?)
      `,
      values,
    );

    return result.affectedRows > 0;
  }

  static async delete(taskId, userId) {
    const [result] = await pool.execute(
      `
        DELETE FROM tasks
        WHERE task_id = ? AND user_id = UUID_TO_BIN(?)
      `,
      [taskId, userId],
    );
    return result.affectedRows > 0;
  }
}

export default Task;
