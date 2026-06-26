import { executeText } from './models/modelRouter.ts';
import type { UnifiedChatMessage, ModelResponseFormat } from './models/types.ts';

export type LlmMessage = UnifiedChatMessage;

export interface LlmResponse {
  content: string;
  model: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

export async function chat(
  role: 'chat' | 'source_discovery' | 'article_generation' | 'fact_extraction',
  messages: LlmMessage[],
  options?: { responseFormat?: ModelResponseFormat },
): Promise<LlmResponse> {
  const result = await executeText(role, {
    messages,
    responseFormat: options?.responseFormat,
  });

  return {
    content: result.content,
    model: result.model,
    usage: result.usage
      ? {
          input_tokens: result.usage.inputTokens,
          output_tokens: result.usage.outputTokens,
        }
      : undefined,
  };
}
