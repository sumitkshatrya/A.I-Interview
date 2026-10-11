import axios from 'axios';

export const parseAiJson = (rawContent) => {
  if (!rawContent || typeof rawContent !== "string") {
    throw new Error("AI returned invalid content.");
  }

  let cleaned = rawContent.trim();

  // Extract from markdown code fence if present
  const markdownMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (markdownMatch) {
    cleaned = markdownMatch[1].trim();
  } else {
    // If no code fence, attempt to extract the outermost JSON object or array
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    const firstBracket = cleaned.indexOf('[');
    const lastBracket = cleaned.lastIndexOf(']');

    if (firstBrace !== -1 && lastBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    } else if (firstBracket !== -1 && lastBracket !== -1) {
      cleaned = cleaned.substring(firstBracket, lastBracket + 1);
    }
  }

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    // Attempt basic JSON repair for common trailing commas
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
