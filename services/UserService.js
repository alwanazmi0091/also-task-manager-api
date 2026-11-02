import User from "../models/User.js";
import argon2 from "argon2";

class UserService {
  static async login(email, password) {
    const user = await User.findByEmail(email);

    if (!user) {
      const error = new Error("Incorrect email or password");
      error.statusCode = 401;
      throw error;
    }

    const isPasswordCorrect = await argon2.verify(user.password_hash, password);

    if (!isPasswordCorrect) {
      const error = new Error("Incorrect email or password");
      error.statusCode = 401;
      throw error;
    }

    return {
      user_id: user.user_id,
      email: user.email,
      name: user.name,
    };
  }

  static async register(newUser) {
    const user = await User.findByEmail(newUser.email);

    if (user) {
      const error = new Error("Email already in use");
      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = await argon2.hash(newUser.password, {
      type: argon2.argon2id,
    });

    const result = await User.create({
      email: newUser.email,
      name: newUser.name,
      password: hashedPassword,
    });

    return result;
  }

  static async fetchUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  static async delete(userId) {
    const result = await User.delete(userId);
    if (!result) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
  }

  static async edit(userId, fields) {
    const updates = { ...fields };

    if (updates.email) {
      const user = await User.findByEmail(updates.email);
      if (user) {
        const error = new Error("Email already in use");
        error.statusCode = 409;
        throw error;
      }
    }

    if (updates.password) {
      updates.password_hash = await argon2.hash(updates.password, {
        type: argon2.argon2id,
      });
      delete updates.password;
    }

    const result = await User.update(userId, updates);
    if (!result) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
  }
}

export default UserService;
