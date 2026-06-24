import {embedText} from './embedding.ts';
import {searchSimilarChunks} from './vectorStore.ts';
import {chat} from './llmService.ts';

export interface RagSource {
  chunkId: number;
  entryId: number;
  entryTitle: string;
  chunkText: string;
  chunkIndex: number;
  sourceType: string | null;
  sourceFilePath: string | null;
}

export interface RagAnswer {
  answer: string;
  sources: RagSource[];
  model: string;
}

const RAG_SYSTEM_PROMPT = `你是一个企业 GEO 优化助手。请基于下面提供的「参考资料」回答用户问题。

要求：
1. 只使用参考资料中的信息，不要编造。
2. 如果参考资料不足以回答问题，请明确说明。
3. 回答时请引用来源，使用 [^1^], [^2^] 这样的格式标注。
4. 保持回答简洁、专业。`;

function formatContext(sources: RagSource[]): string {
  return sources
    .map((s, i) => {
      const ref = `[^${i + 1}^]`;
      return `${ref} 标题：${s.entryTitle}\n来源：${s.sourceType === 'file' ? s.sourceFilePath : '文本'}\n内容：${s.chunkText}`;
    })
    .join('\n\n---\n\n');
}

export async function askQuestion(
  projectId: number,
  query: string,
  limit = 5,
): Promise<RagAnswer> {
  const queryVector = await embedText(query);
  const rawResults = searchSimilarChunks(queryVector, limit);

  // Filter by project
  const {getDb} = await import('../db/connection.ts');
  const db = getDb();
  const sources: RagSource[] = [];
  for (const r of rawResults) {
    const kb = db
      .prepare(
        `SELECT kb.project_id
         FROM knowledge_chunks c
         JOIN knowledge_entries e ON c.entry_id = e.id
         JOIN knowledge_bases kb ON e.kb_id = kb.id
         WHERE c.id = ?`,
      )
      .get(r.chunkId) as {project_id: number} | undefined;
    if (kb?.project_id === projectId) {
      sources.push({
        chunkId: r.chunkId,
        entryId: r.entryId,
        entryTitle: r.entryTitle,
        chunkText: r.chunkText,
        chunkIndex: r.chunkIndex,
        sourceType: r.sourceType,
        sourceFilePath: r.sourceFilePath,
      });
    }
  }

  if (sources.length === 0) {
    return {
      answer:
        '当前知识库中没有找到与问题相关的资料。请先上传企业资料或录入文本。',
      sources: [],
      model: '',
    };
  }

  const context = formatContext(sources);
  const userPrompt = `问题：${query}\n\n参考资料：\n\n${context}\n\n请根据参考资料回答问题。`;

  const response = await chat([
    {role: 'system', content: RAG_SYSTEM_PROMPT},
    {role: 'user', content: userPrompt},
  ]);

  return {
    answer: response.content,
    sources,
    model: response.model,
  };
}
