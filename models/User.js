import pool from "../config/db.js";
import { randomUUID } from "node:crypto";

class User {
  static async findById(userId) {
    const [result] = await pool.execute(
      `
        SELECT BIN_TO_UUID(user_id) AS user_id, email, name
        FROM users
        WHERE user_id = UUID_TO_BIN(?)
      `,
      [userId],
    );

    return result[0] ?? null;
  }

  static async findByEmail(email) {
    const [result] = await pool.execute(
      `
        SELECT BIN_TO_UUID(user_id) AS user_id, email, name, password_hash
        FROM users
        WHERE email = ?
      `,
      [email],
    );

    return result[0] ?? null;
  }

  static async create(user) {
    const id = randomUUID();

    await pool.execute(
      `
        INSERT INTO users (user_id, email, name, password_hash)
        VALUES (UUID_TO_BIN(?), ?, ?, ?)
      `,
      [id, user.email, user.name, user.password],
    );

    return id;
  }

  static async update(userId, fields) {
    const keys = Object.keys(fields);
    const values = Object.values(fields);

    const setClause = keys.map((key) => `${key} = ?`).join(", ");
    values.push(userId);

    const [result] = await pool.execute(
      `
        UPDATE users
        SET ${setClause}
        WHERE user_id = UUID_TO_BIN(?)
      `,
      values,
    );

    return result.affectedRows > 0;
  }

  static async delete(userId) {
    const [result] = await pool.execute(
      `
        DELETE FROM users
        WHERE user_id = UUID_TO_BIN(?)
      `,
      [userId],
    );

    return result.affectedRows > 0;
  }
}

export default User;
