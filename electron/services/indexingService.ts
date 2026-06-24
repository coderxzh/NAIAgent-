import {getDb} from '../db/connection.ts';
import {parseFile} from './parser.ts';
import {splitText} from './chunker.ts';
import {embedTexts} from './embedding.ts';
import {
  deleteChunkVectorsByEntry,
  insertChunkVectors,
} from './vectorStore.ts';

export interface IndexingResult {
  entryId: number;
  chunkCount: number;
  status: 'indexed' | 'failed';
  error?: string;
}

export async function indexEntry(entryId: number): Promise<IndexingResult> {
  const db = getDb();

  try {
    // Lock entry to indexing/ pending
    db.prepare(
      "UPDATE knowledge_entries SET status = 'pending' WHERE id = ?",
    ).run(entryId);

    const entry = db
      .prepare(
        'SELECT id, title, content, source_type, source_file_path FROM knowledge_entries WHERE id = ?',
      )
      .get(entryId) as
      | {
          id: number;
          title: string;
          content: string | null;
          source_type: string | null;
          source_file_path: string | null;
        }
      | undefined;

    if (!entry) {
      throw new Error(`Knowledge entry ${entryId} not found`);
    }

    // Clean up old chunks/vectors
    deleteChunkVectorsByEntry(entryId);
    db.prepare('DELETE FROM knowledge_chunks WHERE entry_id = ?').run(entryId);

    // Get text content
    let text: string;
    if (entry.source_type === 'file' && entry.source_file_path) {
      const parsed = await parseFile(entry.source_file_path);
      text = parsed.text;
    } else {
      text = entry.content ?? '';
    }

    text = text.trim();
    if (text.length === 0) {
      db.prepare(
        "UPDATE knowledge_entries SET status = 'indexed' WHERE id = ?",
      ).run(entryId);
      return {entryId, chunkCount: 0, status: 'indexed'};
    }

    // Chunk
    const chunks = splitText(text, {chunkSize: 800, chunkOverlap: 100});

    // Insert chunks
    const insertChunk = db.prepare(
      'INSERT INTO knowledge_chunks (entry_id, chunk_text, chunk_index) VALUES (?, ?, ?)',
    );

    const chunkIds: number[] = [];
    const transaction = db.transaction(() => {
      for (let i = 0; i < chunks.length; i++) {
        const result = insertChunk.run(entryId, chunks[i].text, i);
        chunkIds.push(Number(result.lastInsertRowid));
      }
    });
    transaction();

    // Generate embeddings in batches
    const batchSize = 32;
    const allEmbeddings: number[][] = [];
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize).map((c) => c.text);
      const result = await embedTexts(batch);
      allEmbeddings.push(...result.embeddings);
    }

    // Insert vectors
    console.log(`Inserting ${chunkIds.length} chunk vectors`);
    insertChunkVectors(chunkIds, allEmbeddings);

    // Mark indexed
    db.prepare(
      "UPDATE knowledge_entries SET status = 'indexed' WHERE id = ?",
    ).run(entryId);

    return {entryId, chunkCount: chunks.length, status: 'indexed'};
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Indexing failed for entry ${entryId}:`, message);
    db.prepare(
      "UPDATE knowledge_entries SET status = 'failed' WHERE id = ?",
    ).run(entryId);
    return {entryId, chunkCount: 0, status: 'failed', error: message};
  }
}

export function getEntryStatus(
  entryId: number,
): 'pending' | 'indexed' | 'failed' | undefined {
  const db = getDb();
  const row = db
    .prepare('SELECT status FROM knowledge_entries WHERE id = ?')
    .get(entryId) as {status: 'pending' | 'indexed' | 'failed'} | undefined;
  return row?.status;
}

export function reindexAllEntries(): Promise<IndexingResult[]> {
  const db = getDb();
  const entries = db
    .prepare('SELECT id FROM knowledge_entries')
    .all() as Array<{id: number}>;
  return Promise.all(entries.map((e) => indexEntry(e.id)));
}
