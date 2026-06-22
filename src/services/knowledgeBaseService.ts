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
      `INSERT INTO knowledge_bases (project_id, name, description, created_at)
       VALUES (${data.project_id}, '${data.name.replace(/'/g, "''")}', '${
         data.description?.replace(/'/g, "''") ?? ''
       }', datetime('now'))`,
    );
    return Number(result.lastInsertRowid);
  },

  async getEntries(kbId: number): Promise<KnowledgeEntry[]> {
    return dbApi.query(
      'SELECT id, kb_id, title, content, source_type, source_file_path, created_at FROM knowledge_entries WHERE kb_id = ? ORDER BY created_at DESC',
      [kbId],
    ) as Promise<KnowledgeEntry[]>;
  },

  async createEntry(
    data: Omit<KnowledgeEntry, 'id' | 'created_at'>,
  ): Promise<number> {
    const result = await dbApi.exec(
      `INSERT INTO knowledge_entries (kb_id, title, content, source_type, source_file_path, created_at)
       VALUES (${data.kb_id}, '${data.title.replace(/'/g, "''")}', '${
         data.content?.replace(/'/g, "''") ?? ''
       }', '${data.source_type?.replace(/'/g, "''") ?? ''}', '${
         data.source_file_path?.replace(/'/g, "''") ?? ''
       }', datetime('now'))`,
    );
    return Number(result.lastInsertRowid);
  },

  async deleteEntry(id: number): Promise<void> {
    await dbApi.exec(`DELETE FROM knowledge_entries WHERE id = ${id}`);
  },
};
