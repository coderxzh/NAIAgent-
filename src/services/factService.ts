import { dbApi } from '../lib/electron-api';
import type { EnterpriseFact } from '../types/domain';

export const factService = {
  async getByProject(projectId: number): Promise<EnterpriseFact[]> {
    return dbApi.query(
      'SELECT id, project_id, fact_type, fact_key, fact_value, confidence, status, created_at FROM enterprise_facts WHERE project_id = ? ORDER BY created_at DESC',
      [projectId],
    ) as Promise<EnterpriseFact[]>;
  },

  async getById(id: number): Promise<EnterpriseFact | undefined> {
    const rows = (await dbApi.query(
      'SELECT id, project_id, fact_type, fact_key, fact_value, confidence, status, created_at FROM enterprise_facts WHERE id = ?',
      [id],
    )) as EnterpriseFact[];
    return rows[0];
  },

  async create(
    data: Omit<EnterpriseFact, 'id' | 'created_at'>,
  ): Promise<number> {
    const confidence = data.confidence ?? 1.0;
    const status = data.status ?? 'draft';
    const result = await dbApi.exec(
      `INSERT INTO enterprise_facts (project_id, fact_type, fact_key, fact_value, confidence, status, created_at)
       VALUES (${data.project_id}, '${data.fact_type.replace(/'/g, "''")}', '${data.fact_key.replace(
         /'/g,
         "''",
       )}', '${data.fact_value?.replace(/'/g, "''") ?? ''}', ${confidence}, '${status}', datetime('now'))`,
    );
    return Number(result.lastInsertRowid);
  },

  async updateStatus(id: number, status: EnterpriseFact['status']): Promise<void> {
    await dbApi.exec(
      `UPDATE enterprise_facts SET status = '${status}' WHERE id = ${id}`,
    );
  },

  async delete(id: number): Promise<void> {
    await dbApi.exec(`DELETE FROM enterprise_facts WHERE id = ${id}`);
  },
};
