import OpenAI from "openai";

export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY. Please add it to .env and restart the dev server.");
  }

  return new OpenAI({ apiKey });
}

export function getOpenAIModel() {
  return process.env.OPENAI_MODEL?.trim() || "gpt-5.5";
}

export function isOpenAIConfigured() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}
