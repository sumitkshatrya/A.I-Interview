import axios from 'axios';

export const parseAiJson = (rawContent) => {
  if (!rawContent || typeof rawContent !== "string") {
    throw new Error("AI returned invalid content.");
  }

  const cleaned = rawContent
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    // Attempt basic JSON repair for common missing bracket/quote issues
    try {
      const repaired = cleaned
        .replace(/,\s*}/g, "}")
        .replace(/,\s*]/g, "]");
      return JSON.parse(repaired);
    } catch (repairErr) {
      throw new Error(`AI non-JSON response parsing failed: ${cleaned.slice(0, 250)}`);
    }
  }
};

export const callAiProvider = async (messages, options = {}) => {
  const { model = "openai/gpt-4o-mini", temperature = 0.7, max_tokens = 2000, retries = 2 } = options;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    throw new Error("Messages payload is empty.");
  }

  let attempt = 0;
  let lastError = null;

  while (attempt <= retries) {
    try {
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        throw new Error("OPENROUTER_API_KEY is not configured.");
      }

      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model,
          messages,
          temperature,
          max_tokens
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://aicareerplatform.local',
            'X-Title': 'AI Career Intelligence Platform'
          },
          timeout: 45000
        }
      );

      const content = response?.data?.choices?.[0]?.message?.content;
      if (!content || !content.trim()) {
        throw new Error("Empty AI response received.");
      }

      return content;
    } catch (err) {
      attempt++;
      lastError = err.response?.data?.error?.message || err.message;
      console.warn(`AI Provider Call Attempt ${attempt} failed: ${lastError}`);
      if (attempt > retries) break;
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }

  throw new Error(`AI Service Provider Error after ${retries + 1} attempts: ${lastError}`);
};

export const callAiProviderJson = async (messages, options = {}) => {
  const rawResponse = await callAiProvider(messages, options);
  return parseAiJson(rawResponse);
};
