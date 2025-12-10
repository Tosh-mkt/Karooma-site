import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";
import type { LLMProvider, ChatbotConfig } from "@shared/schema";

interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface LLMResponse {
  content: string;
  tokensUsed?: number;
  provider: string;
  model: string;
}

interface LLMStreamChunk {
  content: string;
  done: boolean;
}

const LLM_CONFIGS: Record<string, { baseURL?: string; envKey: string }> = {
  deepseek: {
    baseURL: "https://api.deepseek.com",
    envKey: "DEEPSEEK_API_KEY",
  },
  openai: {
    envKey: "OPENAI_API_KEY",
  },
  anthropic: {
    envKey: "ANTHROPIC_API_KEY",
  },
  gemini: {
    envKey: "GEMINI_API_KEY",
  },
};

const DEFAULT_MODELS: Record<string, string> = {
  deepseek: "deepseek-chat",
  openai: "gpt-4o-mini",
  anthropic: "claude-3-5-sonnet-20241022",
  gemini: "gemini-2.0-flash",
};

export class LLMService {
  private provider: LLMProvider;
  private model: string;
  private temperature: number;
  private maxTokens: number;

  constructor(config: Partial<ChatbotConfig> = {}) {
    this.provider = (config.llmProvider as LLMProvider) || "deepseek";
    this.model = config.llmModel || DEFAULT_MODELS[this.provider] || "deepseek-chat";
    this.temperature = config.temperature ? parseFloat(config.temperature) : 0.7;
    this.maxTokens = config.maxTokens || 1024;
  }

  private getApiKey(): string {
    const envKey = LLM_CONFIGS[this.provider]?.envKey || "DEEPSEEK_API_KEY";
    const apiKey = process.env[envKey];
    if (!apiKey) {
      throw new Error(`API key not found for ${this.provider}. Set ${envKey} environment variable.`);
    }
    return apiKey;
  }

  async chat(messages: LLMMessage[]): Promise<LLMResponse> {
    switch (this.provider) {
      case "deepseek":
      case "openai":
        return this.chatOpenAICompatible(messages);
      case "anthropic":
        return this.chatAnthropic(messages);
      case "gemini":
        return this.chatGemini(messages);
      default:
        return this.chatOpenAICompatible(messages);
    }
  }

  private async chatOpenAICompatible(messages: LLMMessage[]): Promise<LLMResponse> {
    const config = LLM_CONFIGS[this.provider];
    const client = new OpenAI({
      apiKey: this.getApiKey(),
      baseURL: config?.baseURL,
    });

    const response = await client.chat.completions.create({
      model: this.model,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: this.temperature,
      max_tokens: this.maxTokens,
    });

    return {
      content: response.choices[0]?.message?.content || "",
      tokensUsed: response.usage?.total_tokens,
      provider: this.provider,
      model: this.model,
    };
  }

  private async chatAnthropic(messages: LLMMessage[]): Promise<LLMResponse> {
    const client = new Anthropic({ apiKey: this.getApiKey() });

    const systemMessage = messages.find((m) => m.role === "system");
    const chatMessages = messages.filter((m) => m.role !== "system");

    const response = await client.messages.create({
      model: this.model,
      max_tokens: this.maxTokens,
      system: systemMessage?.content || "",
      messages: chatMessages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const textContent = response.content.find((c) => c.type === "text");

    return {
      content: textContent?.type === "text" ? textContent.text : "",
      tokensUsed: response.usage?.input_tokens + response.usage?.output_tokens,
      provider: this.provider,
      model: this.model,
    };
  }

  private async chatGemini(messages: LLMMessage[]): Promise<LLMResponse> {
    const genAI = new GoogleGenAI({ apiKey: this.getApiKey() });

    const systemMessage = messages.find((m) => m.role === "system");
    const chatMessages = messages.filter((m) => m.role !== "system");

    const contents = chatMessages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await genAI.models.generateContent({
      model: this.model,
      contents,
      config: {
        temperature: this.temperature,
        maxOutputTokens: this.maxTokens,
        systemInstruction: systemMessage?.content,
      },
    });

    return {
      content: response.text || "",
      tokensUsed: response.usageMetadata?.totalTokenCount,
      provider: this.provider,
      model: this.model,
    };
  }

  async *streamChat(messages: LLMMessage[]): AsyncGenerator<LLMStreamChunk> {
    switch (this.provider) {
      case "deepseek":
      case "openai":
        yield* this.streamOpenAICompatible(messages);
        break;
      case "anthropic":
        yield* this.streamAnthropic(messages);
        break;
      case "gemini":
        yield* this.streamGemini(messages);
        break;
      default:
        yield* this.streamOpenAICompatible(messages);
    }
  }

  private async *streamOpenAICompatible(messages: LLMMessage[]): AsyncGenerator<LLMStreamChunk> {
    const config = LLM_CONFIGS[this.provider];
    const client = new OpenAI({
      apiKey: this.getApiKey(),
      baseURL: config?.baseURL,
    });

    const stream = await client.chat.completions.create({
      model: this.model,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: this.temperature,
      max_tokens: this.maxTokens,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      const done = chunk.choices[0]?.finish_reason === "stop";
      yield { content, done };
    }
  }

  private async *streamAnthropic(messages: LLMMessage[]): AsyncGenerator<LLMStreamChunk> {
    const client = new Anthropic({ apiKey: this.getApiKey() });

    const systemMessage = messages.find((m) => m.role === "system");
    const chatMessages = messages.filter((m) => m.role !== "system");

    const stream = client.messages.stream({
      model: this.model,
      max_tokens: this.maxTokens,
      system: systemMessage?.content || "",
      messages: chatMessages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        yield { content: event.delta.text, done: false };
      }
      if (event.type === "message_stop") {
        yield { content: "", done: true };
      }
    }
  }

  private async *streamGemini(messages: LLMMessage[]): AsyncGenerator<LLMStreamChunk> {
    const genAI = new GoogleGenAI({ apiKey: this.getApiKey() });

    const systemMessage = messages.find((m) => m.role === "system");
    const chatMessages = messages.filter((m) => m.role !== "system");

    const contents = chatMessages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await genAI.models.generateContentStream({
      model: this.model,
      contents,
      config: {
        temperature: this.temperature,
        maxOutputTokens: this.maxTokens,
        systemInstruction: systemMessage?.content,
      },
    });

    for await (const chunk of response) {
      yield { content: chunk.text || "", done: false };
    }
    yield { content: "", done: true };
  }

  getProviderInfo() {
    return {
      provider: this.provider,
      model: this.model,
      temperature: this.temperature,
      maxTokens: this.maxTokens,
    };
  }

  static getSupportedProviders() {
    return Object.keys(LLM_CONFIGS);
  }

  static getDefaultModel(provider: string): string {
    return DEFAULT_MODELS[provider] || "deepseek-chat";
  }
}

export function createLLMService(config?: Partial<ChatbotConfig>): LLMService {
  return new LLMService(config);
}
