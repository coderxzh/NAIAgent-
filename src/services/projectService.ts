import { dbApi } from '../lib/electron-api';
import type { Project } from '../types/domain';

export const projectService = {
  async getAll(): Promise<Project[]> {
    return dbApi.query(
      'SELECT id, name, description, created_at, updated_at FROM projects ORDER BY updated_at DESC',
    ) as Promise<Project[]>;
  },

  async getById(id: number): Promise<Project | undefined> {
    const rows = (await dbApi.query(
      'SELECT id, name, description, created_at, updated_at FROM projects WHERE id = ?',
      [id],
    )) as Project[];
    return rows[0];
  },

  async create(
    data: Omit<Project, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<number> {
    const result = await dbApi.exec(
      "INSERT INTO projects (name, description, created_at, updated_at) VALUES (?, ?, datetime('now'), datetime('now'))",
      [data.name, data.description ?? null],
    );
    return Number(result.lastInsertRowid);
  },

  async update(id: number, data: Partial<Project>): Promise<void> {
    const fields: string[] = [];
    const params: unknown[] = [];
    if (data.name !== undefined) {
      fields.push('name = ?');
      params.push(data.name);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      params.push(data.description);
    }
    if (fields.length === 0) return;
    fields.push("updated_at = datetime('now')");
    params.push(id);
    await dbApi.exec(
      `UPDATE projects SET ${fields.join(', ')} WHERE id = ?`,
      params,
    );
  },

  async delete(id: number): Promise<void> {
    await dbApi.exec('DELETE FROM projects WHERE id = ?', [id]);
  },
};
