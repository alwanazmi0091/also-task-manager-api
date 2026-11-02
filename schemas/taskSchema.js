import { z } from "zod";

export const taskIdSchema = z.strictObject({
  id: z.coerce.number().int().positive().safe(),
});

export const getTaskQuerySchema = z.strictObject({
  search: z.string().trim().min(1).optional(),
  isCompleted: z
    .enum(["true", "false"])
    .transform((data) => data === "true")
    .optional(),
  page: z.preprocess(
    (val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
    z.coerce.number().int().positive().safe().default(1),
  ),
  limit: z.preprocess(
    (val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
    z.coerce.number().int().positive().safe().default(10),
  ),
  sortBy: z
    .enum(["task_id", "task_content", "created_at", "updated_at"])
    .default("created_at"),
  sortOrder: z.enum(["ASC", "DESC"]).default("DESC"),
});

export const taskContentSchema = z.strictObject({
  task: z.string().trim().min(1),
});

export const updateTaskSchema = z
  .strictObject({
    taskContent: z.string().trim().min(1).optional(),
    isCompleted: z.boolean().optional(),
  })
  .refine(
    (data) => data.taskContent !== undefined || data.isCompleted !== undefined,
    {
      message: "At least one field must be provided",
    },
  );
