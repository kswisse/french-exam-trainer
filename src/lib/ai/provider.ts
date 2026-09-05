import { GeminiProvider } from "./gemini";
import type { AIProvider } from "./types";

let provider: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (!provider) {
    provider = new GeminiProvider();
  }
  return provider;
}
