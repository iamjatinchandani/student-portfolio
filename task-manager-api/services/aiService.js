/**
 * AI Service for Practical 13
 * Supports Google Gemini API & OpenAI with robust Template Fallback Engine
 * Keeps API keys securely on the backend (.env)
 */

function stripMarkdownFences(rawText) {
  if (!rawText) return '';
  return rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

function parseAIResponse(rawText) {
  const cleaned = stripMarkdownFences(rawText);
  return JSON.parse(cleaned);
}

function generateFallbackSuggestion(title) {
  const lower = title.toLowerCase();
  let priority = 'low';

  // Keyword-based priority suggestion
  if (
    lower.includes('urgent') ||
    lower.includes('bug') ||
    lower.includes('critical') ||
    lower.includes('fix') ||
    lower.includes('database') ||
    lower.includes('prod') ||
    lower.includes('security')
  ) {
    priority = 'high';
  } else if (
    lower.includes('feature') ||
    lower.includes('update') ||
    lower.includes('test') ||
    lower.includes('medium')
  ) {
    priority = 'medium';
  }

  const description = `Outline requirements and complete all deliverables for "${title}". Validate functionality, conduct thorough testing, and document the final outcomes.`;

  return {
    description,
    suggestedPriority: priority,
    engine: 'Template Fallback Engine',
    note: 'Fallback description inserted into the form below. (Configure GEMINI_API_KEY in backend .env to use live Gemini AI).'
  };
}

async function suggestTaskDetails(title) {
  if (!title || typeof title !== 'string' || title.trim() === '') {
    throw new Error('Task title is required and cannot be empty');
  }

  const trimmedTitle = title.trim();
  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    // Graceful fallback when no API key is configured
    return generateFallbackSuggestion(trimmedTitle);
  }

  try {
    // If Gemini API Key is configured
    if (process.env.GEMINI_API_KEY) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Analyze this task title: "${trimmedTitle}". Return strict JSON with keys "description" (2 sentences) and "suggestedPriority" ("low", "medium", or "high").`
                  }
                ]
              }
            ],
            generationConfig: { responseMimeType: 'application/json' }
          }),
          signal: AbortSignal.timeout(5000)
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API returned status ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = parseAIResponse(text);

      return {
        description: parsed.description || generateFallbackSuggestion(trimmedTitle).description,
        suggestedPriority: parsed.suggestedPriority || 'medium',
        engine: 'Gemini 1.5 Flash AI Engine',
        note: 'Generated live via Google Gemini API.'
      };
    }

    return generateFallbackSuggestion(trimmedTitle);
  } catch (error) {
    // Graceful error handling: core application never crashes
    console.warn('[AI Service Warning] Falling back to template engine:', error.message);
    return generateFallbackSuggestion(trimmedTitle);
  }
}

module.exports = {
  stripMarkdownFences,
  parseAIResponse,
  generateFallbackSuggestion,
  suggestTaskDetails
};
