import { dbApi } from '../lib/electron-api';
import type { ChatMessage, ChatSession } from '../types/domain';

export const chatService = {
  async getSessions(projectId: number): Promise<ChatSession[]> {
    return dbApi.query(
      'SELECT id, project_id, title, session_type, created_at FROM chat_sessions WHERE project_id = ? ORDER BY created_at DESC',
      [projectId],
    ) as Promise<ChatSession[]>;
  },

  async getMessages(sessionId: number): Promise<ChatMessage[]> {
    return dbApi.query(
      'SELECT id, session_id, role, content, model, created_at FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC',
      [sessionId],
    ) as Promise<ChatMessage[]>;
  },

  async createSession(
    projectId: number,
    title: string,
  ): Promise<number> {
    const result = await dbApi.exec(
      `INSERT INTO chat_sessions (project_id, title, session_type, created_at)
       VALUES (${projectId}, '${title.replace(/'/g, "''")}', 'public', datetime('now'))`,
    );
    return Number(result.lastInsertRowid);
  },

  async addMessage(
    data: Omit<ChatMessage, 'id' | 'created_at'>,
  ): Promise<number> {
    const result = await dbApi.exec(
      `INSERT INTO chat_messages (session_id, role, content, model, created_at)
       VALUES (${data.session_id}, '${data.role}', '${data.content.replace(
         /'/g,
         "''",
       )}', '${data.model?.replace(/'/g, "''") ?? ''}', datetime('now'))`,
    );
    return Number(result.lastInsertRowid);
  },

  async deleteSession(id: number): Promise<void> {
    await dbApi.exec(`DELETE FROM chat_sessions WHERE id = ${id}`);
  },
};
