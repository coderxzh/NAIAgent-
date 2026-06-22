import { dbApi } from '../lib/electron-api';
import type { GeoArtifact, GeoRun, GeoRunStep } from '../types/domain';

export const geoRunService = {
  async getByProject(projectId: number): Promise<GeoRun[]> {
    return dbApi.query(
      'SELECT id, project_id, knowledge_base_id, status, created_at FROM geo_runs WHERE project_id = ? ORDER BY created_at DESC',
      [projectId],
    ) as Promise<GeoRun[]>;
  },

  async getById(id: number): Promise<GeoRun | undefined> {
    const rows = (await dbApi.query(
      'SELECT id, project_id, knowledge_base_id, status, created_at FROM geo_runs WHERE id = ?',
      [id],
    )) as GeoRun[];
    return rows[0];
  },

  async create(
    data: Omit<GeoRun, 'id' | 'created_at' | 'status'>,
  ): Promise<number> {
    const kb = data.knowledge_base_id ?? 'NULL';
    const result = await dbApi.exec(
      `INSERT INTO geo_runs (project_id, knowledge_base_id, status, created_at)
       VALUES (${data.project_id}, ${kb}, 'pending', datetime('now'))`,
    );
    return Number(result.lastInsertRowid);
  },

  async updateStatus(id: number, status: GeoRun['status']): Promise<void> {
    await dbApi.exec(
      `UPDATE geo_runs SET status = '${status}' WHERE id = ${id}`,
    );
  },

  async getSteps(runId: number): Promise<GeoRunStep[]> {
    return dbApi.query(
      'SELECT id, run_id, step_type, step_data, status, created_at FROM geo_run_steps WHERE run_id = ? ORDER BY created_at ASC',
      [runId],
    ) as Promise<GeoRunStep[]>;
  },

  async addStep(
    data: Omit<GeoRunStep, 'id' | 'created_at'>,
  ): Promise<number> {
    const result = await dbApi.exec(
      `INSERT INTO geo_run_steps (run_id, step_type, step_data, status, created_at)
       VALUES (${data.run_id}, '${data.step_type.replace(/'/g, "''")}', '${
         data.step_data?.replace(/'/g, "''") ?? ''
       }', '${data.status}', datetime('now'))`,
    );
    return Number(result.lastInsertRowid);
  },

  async getArtifacts(runId: number): Promise<GeoArtifact[]> {
    return dbApi.query(
      'SELECT id, run_id, artifact_type, title, content, created_at FROM geo_artifacts WHERE run_id = ? ORDER BY created_at DESC',
      [runId],
    ) as Promise<GeoArtifact[]>;
  },
};
