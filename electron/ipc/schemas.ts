import {z} from 'zod';

export const DbQuerySchema = z.object({
  sql: z.string().min(1),
  params: z.array(z.unknown()).optional(),
});

export const DbExecSchema = z.object({
  sql: z.string().min(1),
  params: z.array(z.unknown()).optional(),
});

export type DbExecInput = z.infer<typeof DbExecSchema>;

export const KbIngestTextSchema = z.object({
  projectId: z.number().int().positive(),
  title: z.string().min(1),
  content: z.string().min(1),
});

export const KbIngestFileSchema = z.object({
  projectId: z.number().int().positive(),
  title: z.string().min(1),
  filePath: z.string().min(1),
});

export const KbIndexEntrySchema = z.object({
  entryId: z.number().int().positive(),
});

export const KbSearchSchema = z.object({
  projectId: z.number().int().positive(),
  query: z.string().min(1),
  limit: z.number().int().min(1).max(50).optional(),
});

export const RagAskSchema = z.object({
  projectId: z.number().int().positive(),
  query: z.string().min(1),
  limit: z.number().int().min(1).max(50).optional(),
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
