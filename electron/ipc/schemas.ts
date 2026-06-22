import {z} from 'zod';

export const DbQuerySchema = z.object({
  sql: z.string().min(1),
  params: z.array(z.unknown()).optional(),
});

export const VectorSearchSchema = z.object({
  table: z.string().min(1),
  queryVector: z.array(z.number()).min(1),
  limit: z.number().int().min(1).max(100).default(10),
});

export const OpenFileSchema = z.object({
  multiple: z.boolean().optional(),
  filters: z
    .array(
      z.object({
        name: z.string(),
        extensions: z.array(z.string()).min(1),
      }),
    )
    .optional(),
});

export const AppPathSchema = z.enum(['userData', 'home', 'downloads']);
