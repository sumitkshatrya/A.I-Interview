import axios from 'axios';

const removeTrailingCommas = (candidate) => {
  let repaired = '';
  let inString = false;
  let escaped = false;

  for (let index = 0; index < candidate.length; index += 1) {
    const character = candidate[index];

    if (inString) {
      repaired += character;
      if (escaped) {
        escaped = false;
      } else if (character === '\\') {
        escaped = true;
      } else if (character === '"') {
        inString = false;
      }
      continue;
    }

    if (character === '"') {
      inString = true;
      repaired += character;
    } else if (character === ',') {
      let next = index + 1;
      while (next < candidate.length && /\s/.test(candidate[next])) next += 1;
      if (candidate[next] !== '}' && candidate[next] !== ']') repaired += character;
    } else {
      repaired += character;
    }
  }

  return repaired;
};

const parseJsonCandidate = (candidate) => {
  try {
    return { success: true, value: JSON.parse(candidate) };
  } catch {
    const repaired = removeTrailingCommas(candidate);

    try {
      return { success: true, value: JSON.parse(repaired) };
    } catch {
      return { success: false };
    }
  }
};

const extractJsonCandidates = (content) => {
  const candidates = [];
  let start = -1;
  let stack = [];
  let inString = false;
  let escaped = false;

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (character === '\\') {
        escaped = true;
      } else if (character === '"') {
        inString = false;
      }
      continue;
    }

    if (character === '"') {
      inString = true;
    } else if (character === '{' || character === '[') {
      if (stack.length === 0) start = index;
      stack.push(character === '{' ? '}' : ']');
    } else if ((character === '}' || character === ']') && stack.length > 0) {
      if (stack[stack.length - 1] === character) {
        stack.pop();
        if (stack.length === 0) {
          candidates.push(content.slice(start, index + 1));
          start = -1;
        }
      }
    }
  }

  return candidates;
};

export const parseAiJson = (rawContent) => {
  if (!rawContent || typeof rawContent !== "string") {
    throw new Error("AI returned invalid content.");
  }

  const cleaned = rawContent.trim();
  const fencedCandidates = [...cleaned.matchAll(/```(?:json)?\s*([\s\S]*?)\s*```/gi)];

  const directCandidate = parseJsonCandidate(cleaned);
  if (directCandidate.success) return directCandidate.value;

  for (const match of fencedCandidates) {
    const candidate = parseJsonCandidate(match[1].trim());
    if (candidate.success) return candidate.value;
  }

  for (const candidateText of extractJsonCandidates(cleaned)) {
    const candidate = parseJsonCandidate(candidateText);
    if (candidate.success) return candidate.value;
  }

  throw new Error(`AI non-JSON response parsing failed: ${cleaned.slice(0, 250)}`);
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
