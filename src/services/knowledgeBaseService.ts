import { dbApi } from '../lib/electron-api';
import type { KnowledgeBase, KnowledgeEntry } from '../types/domain';

export const knowledgeBaseService = {
  async getByProject(projectId: number): Promise<KnowledgeBase[]> {
    return dbApi.query(
      'SELECT id, project_id, name, description, created_at FROM knowledge_bases WHERE project_id = ? ORDER BY created_at DESC',
      [projectId],
    ) as Promise<KnowledgeBase[]>;
  },

  async getById(id: number): Promise<KnowledgeBase | undefined> {
    const rows = (await dbApi.query(
      'SELECT id, project_id, name, description, created_at FROM knowledge_bases WHERE id = ?',
      [id],
    )) as KnowledgeBase[];
    return rows[0];
  },

  async create(
    data: Omit<KnowledgeBase, 'id' | 'created_at'>,
  ): Promise<number> {
    const result = await dbApi.exec(
      "INSERT INTO knowledge_bases (project_id, name, description, created_at) VALUES (?, ?, ?, datetime('now'))",
      [data.project_id, data.name, data.description ?? null],
    );
    return Number(result.lastInsertRowid);
  },

  async update(id: number, data: Partial<KnowledgeBase>): Promise<void> {
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
    params.push(id);
    await dbApi.exec(
      `UPDATE knowledge_bases SET ${fields.join(', ')} WHERE id = ?`,
      params,
    );
  },

  async delete(id: number): Promise<void> {
    await dbApi.exec('DELETE FROM knowledge_bases WHERE id = ?', [id]);
  },

  async getEntries(kbId: number): Promise<KnowledgeEntry[]> {
    return dbApi.query(
      'SELECT id, kb_id, title, content, source_type, source_file_path, status, created_at FROM knowledge_entries WHERE kb_id = ? ORDER BY created_at DESC',
      [kbId],
    ) as Promise<KnowledgeEntry[]>;
  },

  async ingestText(kbId: number, title: string, content: string): Promise<number> {
    const result = await dbApi.exec(
      "INSERT INTO knowledge_entries (kb_id, title, content, source_type, source_file_path, status, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))",
      [kbId, title, content, 'text', null, 'pending'],
    );
    return Number(result.lastInsertRowid);
  },

  async ingestFile(kbId: number, title: string, filePath: string): Promise<number> {
    const result = await dbApi.exec(
      "INSERT INTO knowledge_entries (kb_id, title, content, source_type, source_file_path, status, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))",
      [kbId, title, null, 'file', filePath, 'pending'],
    );
    return Number(result.lastInsertRowid);
  },

  async deleteEntry(id: number): Promise<void> {
    await dbApi.exec('DELETE FROM knowledge_entries WHERE id = ?', [id]);
  },
};
