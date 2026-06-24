export interface EmbeddingResult {
  embeddings: number[][];
  dimension: number;
  model: string;
}

interface OpenAIEmbeddingResponse {
  data: Array<{
    embedding: number[];
    index: number;
    object: string;
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

function getEnv(name: string, fallback?: string): string | undefined {
  return process.env[name] ?? fallback;
}

export function getEmbeddingConfig(): {
  apiKey: string;
  baseUrl: string;
  model: string;
} {
  const apiKey =
    getEnv('EMBEDDING_API_KEY') ??
    getEnv('ANTHROPIC_API_KEY') ??
    getEnv('ANTHROPIC_AUTH_TOKEN');
  const baseUrl = getEnv('EMBEDDING_BASE_URL') ?? getEnv('ANTHROPIC_BASE_URL') ?? 'https://api.openai.com/v1';
  const model = getEnv('EMBEDDING_MODEL') ?? 'text-embedding-3-small';

  if (!apiKey) {
    throw new Error(
      'Embedding API key not configured. Set EMBEDDING_API_KEY or ANTHROPIC_API_KEY environment variable.',
    );
  }

  return {apiKey, baseUrl: baseUrl.replace(/\/$/, ''), model};
}

export async function embedTexts(texts: string[]): Promise<EmbeddingResult> {
  if (texts.length === 0) {
    throw new Error('Cannot embed empty text array');
  }

  const {apiKey, baseUrl, model} = getEmbeddingConfig();
  const url = `${baseUrl}/embeddings`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: texts,
      encoding_format: 'float',
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(
      `Embedding request failed: ${response.status} ${response.statusText}\n${body}`,
    );
  }

  const data = (await response.json()) as OpenAIEmbeddingResponse;
  const embeddings = data.data
    .sort((a, b) => a.index - b.index)
    .map((item) => item.embedding);

  const dimension = embeddings[0]?.length ?? 0;
  if (dimension === 0) {
    throw new Error('Embedding response contained empty vectors');
  }

  // Validate all vectors have same dimension
  for (const vec of embeddings) {
    if (vec.length !== dimension) {
      throw new Error('Embedding vectors have inconsistent dimensions');
    }
  }

  return {embeddings, dimension, model: data.model ?? model};
}

export async function embedText(text: string): Promise<number[]> {
  const result = await embedTexts([text]);
  return result.embeddings[0];
}

export function getEmbeddingDimension(): number | undefined {
  try {
    const {model} = getEmbeddingConfig();
    // Common known dimensions
    if (model.includes('text-embedding-3-small')) return 1536;
    if (model.includes('text-embedding-3-large')) return 3072;
    if (model.includes('text-embedding-ada-002')) return 1536;
    if (model.includes('kimi-embedding')) return 1024;
    return undefined;
  } catch {
    return undefined;
  }
}
