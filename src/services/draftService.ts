import { dbApi } from '../lib/electron-api';
import type { GeoArtifact } from '../types/domain';

export const draftService = {
  async getByRun(runId: number): Promise<GeoArtifact[]> {
    return dbApi.query(
      'SELECT id, run_id, artifact_type, title, content, created_at FROM geo_artifacts WHERE run_id = ? ORDER BY created_at DESC',
      [runId],
    ) as Promise<GeoArtifact[]>;
  },

  async getById(id: number): Promise<GeoArtifact | undefined> {
    const rows = (await dbApi.query(
      'SELECT id, run_id, artifact_type, title, content, created_at FROM geo_artifacts WHERE id = ?',
      [id],
    )) as GeoArtifact[];
    return rows[0];
  },

  async create(
    data: Omit<GeoArtifact, 'id' | 'created_at'>,
  ): Promise<number> {
    const result = await dbApi.exec(
      `INSERT INTO geo_artifacts (run_id, artifact_type, title, content, created_at)
       VALUES (${data.run_id}, '${data.artifact_type.replace(
         /'/g,
         "''",
       )}', '${data.title?.replace(/'/g, "''") ?? ''}', '${
         data.content?.replace(/'/g, "''") ?? ''
       }', datetime('now'))`,
    );
    return Number(result.lastInsertRowid);
  },

  async updateArtifact(id: number, content: string): Promise<void> {
    await dbApi.exec(
      `UPDATE geo_artifacts SET content = '${content.replace(
        /'/g,
        "''",
      )}' WHERE id = ${id}`,
    );
  },

  async delete(id: number): Promise<void> {
    await dbApi.exec(`DELETE FROM geo_artifacts WHERE id = ${id}`);
  },
};
