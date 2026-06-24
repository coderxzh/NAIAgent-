import type {Database} from 'better-sqlite3';
import {getDb} from '../db/connection.ts';

let currentDimension: number | null = null;

function ensureVectorTable(db: Database, dimension: number) {
  if (currentDimension && currentDimension !== dimension) {
    throw new Error(
      `Embedding dimension changed from ${currentDimension} to ${dimension}. ` +
        'All embeddings must use the same dimension.',
    );
  }

  console.log(`Creating vector table with dimension ${dimension}`);
  db.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS knowledge_chunk_vectors USING vec0(
      chunk_id INTEGER,
      embedding float[${dimension}]
    )
  `);
  console.log('Vector table created or already exists');

  currentDimension = dimension;
}

export interface VectorSearchResult {
  chunkId: number;
  distance: number;
  chunkText: string;
  chunkIndex: number;
  entryId: number;
  entryTitle: string;
  sourceType: string | null;
  sourceFilePath: string | null;
}

export function insertChunkVectors(
  chunkIds: number[],
  embeddings: number[][],
): void {
  if (chunkIds.length === 0 || embeddings.length === 0) return;
  if (chunkIds.length !== embeddings.length) {
    throw new Error('chunkIds and embeddings must have the same length');
  }

  const dimension = embeddings[0].length;
  const db = getDb();
  ensureVectorTable(db, dimension);

  const insert = db.prepare(
    'INSERT INTO knowledge_chunk_vectors (chunk_id, embedding) VALUES (CAST(? AS INTEGER), ?)',
  );

  const transaction = db.transaction(() => {
    for (let i = 0; i < chunkIds.length; i++) {
      insert.run(chunkIds[i], JSON.stringify(embeddings[i]));
    }
  });

  transaction();
}

export function deleteChunkVectorsByEntry(entryId: number): void {
  const db = getDb();
  if (!hasVectorTable()) return;
  db.prepare(
    `DELETE FROM knowledge_chunk_vectors
     WHERE chunk_id IN (
       SELECT id FROM knowledge_chunks WHERE entry_id = ?
     )`,
  ).run(entryId);
}

export function searchSimilarChunks(
  queryVector: number[],
  limit = 5,
): VectorSearchResult[] {
  const dimension = queryVector.length;
  const db = getDb();
  ensureVectorTable(db, dimension);

  const stmt = db.prepare(
    `SELECT
       v.chunk_id,
       v.distance,
       c.chunk_text,
       c.chunk_index,
       c.entry_id,
       e.title AS entry_title,
       e.source_type,
       e.source_file_path
     FROM (
       SELECT chunk_id, distance
       FROM knowledge_chunk_vectors
       WHERE embedding MATCH ?
         AND k = ?
     ) v
     JOIN knowledge_chunks c ON v.chunk_id = c.id
     JOIN knowledge_entries e ON c.entry_id = e.id
     ORDER BY v.distance`,
  );

  const rows = stmt.all(JSON.stringify(queryVector), limit) as Array<{
    chunk_id: number;
    distance: number;
    chunk_text: string;
    chunk_index: number;
    entry_id: number;
    entry_title: string;
    source_type: string | null;
    source_file_path: string | null;
  }>;

  return rows.map((row) => ({
    chunkId: row.chunk_id,
    distance: row.distance,
    chunkText: row.chunk_text,
    chunkIndex: row.chunk_index,
    entryId: row.entry_id,
    entryTitle: row.entry_title,
    sourceType: row.source_type,
    sourceFilePath: row.source_file_path,
  }));
}

export function getVectorDimension(): number | null {
  return currentDimension;
}

export function hasVectorTable(): boolean {
  const db = getDb();
  const row = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='knowledge_chunk_vectors'",
    )
    .get() as {name: string} | undefined;
  return !!row;
}
