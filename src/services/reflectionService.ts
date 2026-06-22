import { dbApi } from '../lib/electron-api';
import type { ReflectionRule } from '../types/domain';

export const reflectionService = {
  async getAll(): Promise<ReflectionRule[]> {
    return dbApi.query(
      'SELECT id, scope, industry, rule_text, status, created_at FROM reflection_rules ORDER BY created_at DESC',
    ) as Promise<ReflectionRule[]>;
  },

  async getById(id: number): Promise<ReflectionRule | undefined> {
    const rows = (await dbApi.query(
      'SELECT id, scope, industry, rule_text, status, created_at FROM reflection_rules WHERE id = ?',
      [id],
    )) as ReflectionRule[];
    return rows[0];
  },

  async create(
    data: Omit<ReflectionRule, 'id' | 'created_at'>,
  ): Promise<number> {
    const result = await dbApi.exec(
      `INSERT INTO reflection_rules (scope, industry, rule_text, status, created_at)
       VALUES ('${data.scope.replace(/'/g, "''")}', '${
         data.industry?.replace(/'/g, "''") ?? ''
       }', '${data.rule_text.replace(
         /'/g,
         "''",
       )}', '${data.status.replace(/'/g, "''")}', datetime('now'))`,
    );
    return Number(result.lastInsertRowid);
  },

  async updateStatus(id: number, status: ReflectionRule['status']): Promise<void> {
    await dbApi.exec(
      `UPDATE reflection_rules SET status = '${status.replace(
        /'/g,
        "''",
      )}' WHERE id = ${id}`,
    );
  },
};
