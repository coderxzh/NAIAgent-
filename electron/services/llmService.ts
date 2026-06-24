export interface LlmMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface LlmResponse {
  content: string;
  model: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

interface AnthropicMessageResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

function getLlmConfig(): {
  apiKey: string;
  baseUrl: string;
  model: string;
} {
  const apiKey = process.env.ANTHROPIC_API_KEY ?? process.env.ANTHROPIC_AUTH_TOKEN;
  const baseUrl = process.env.ANTHROPIC_BASE_URL ?? 'https://api.anthropic.com/v1';
  const model =
    process.env.ANTHROPIC_MODEL ??
    process.env.ANTHROPIC_DEFAULT_SONNET_MODEL ??
    'claude-sonnet-4-7-20251101';

  if (!apiKey) {
    throw new Error(
      'LLM API key not configured. Set ANTHROPIC_API_KEY environment variable.',
    );
  }

  return {apiKey, baseUrl: baseUrl.replace(/\/$/, ''), model};
}

export async function chat(messages: LlmMessage[]): Promise<LlmResponse> {
  const {apiKey, baseUrl, model} = getLlmConfig();
  const url = `${baseUrl}/messages`;

  const systemMessage = messages.find((m) => m.role === 'system');
  const conversationMessages = messages.filter((m) => m.role !== 'system');

  const body: Record<string, unknown> = {
    model,
    max_tokens: 4096,
    messages: conversationMessages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  };

  if (systemMessage) {
    body.system = systemMessage.content;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(
      `LLM request failed: ${response.status} ${response.statusText}\n${text}`,
    );
  }

  const data = (await response.json()) as AnthropicMessageResponse;
  const textContent = data.content
    .filter((c) => c.type === 'text')
    .map((c) => c.text)
    .join('');

  return {
    content: textContent,
    model: data.model,
    usage: data.usage,
  };
}
