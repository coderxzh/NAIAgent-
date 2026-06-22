import { dbApi } from '../lib/electron-api';
import type { VisibilityCheck } from '../types/domain';

export const visibilityService = {
  async getByPublishRecord(
    publishRecordId: number,
  ): Promise<VisibilityCheck[]> {
    return dbApi.query(
      'SELECT id, publish_record_id, query, rank, checked_at FROM visibility_checks WHERE publish_record_id = ? ORDER BY checked_at DESC',
      [publishRecordId],
    ) as Promise<VisibilityCheck[]>;
  },

  async create(
    data: Omit<VisibilityCheck, 'id' | 'checked_at'>,
  ): Promise<number> {
    const rank = data.rank ?? 'NULL';
    const result = await dbApi.exec(
      `INSERT INTO visibility_checks (publish_record_id, query, rank, checked_at)
       VALUES (${data.publish_record_id}, '${
         data.query?.replace(/'/g, "''") ?? ''
       }', ${rank}, datetime('now'))`,
    );
    return Number(result.lastInsertRowid);
  },
};
