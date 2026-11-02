import { z } from "zod";

export const loginUserSchema = z.strictObject({
  email: z.email().trim().toLowerCase().max(255),
  password: z.string().min(1).max(255),
});

export const registerUserSchema = z.strictObject({
  email: z.email().trim().toLowerCase().max(255),
  name: z.string().trim().min(1).max(255),
  password: z.string().min(8).max(255),
});

export const editUserSchema = z
  .strictObject({
    email: z.email().trim().toLowerCase().max(255).optional(),
    name: z.string().trim().min(1).max(255).optional(),
    password: z.string().min(8).max(255).optional(),
  })
  .refine(
    (data) =>
      data.email !== undefined ||
      data.name !== undefined ||
      data.password !== undefined,
    {
      message: "At least one field must be provided",
    },
  );
