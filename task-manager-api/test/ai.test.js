const { test, describe } = require('node:test');
const assert = require('node:assert');
const {
  stripMarkdownFences,
  parseAIResponse,
  generateFallbackSuggestion,
  suggestTaskDetails
} = require('../services/aiService');

describe('Practical 13: AI API Integration Test Suite', () => {

  test('AI Parser: correctly strips markdown code fences and parses JSON', () => {
    const rawFenced = '```json\n{"description": "Optimized DB queries", "suggestedPriority": "high"}\n```';
    const parsed = parseAIResponse(rawFenced);

    assert.strictEqual(parsed.description, 'Optimized DB queries');
    assert.strictEqual(parsed.suggestedPriority, 'high');
  });

  test('AI Fallback: generates intelligent description and high priority for critical keywords', () => {
    const urgentTask = 'Fix urgent database indexing bug';
    const result = generateFallbackSuggestion(urgentTask);

    assert.strictEqual(result.suggestedPriority, 'high');
    assert.ok(result.description.includes(urgentTask));
    assert.strictEqual(result.engine, 'Template Fallback Engine');
  });

  test('AI Service: rejects empty title with clear validation error', async () => {
    await assert.rejects(
      async () => {
        await suggestTaskDetails('');
      },
      /Task title is required/
    );

    await assert.rejects(
      async () => {
        await suggestTaskDetails('   ');
      },
      /Task title is required/
    );
  });

  test('AI Service: returns structured result and never exposes backend secrets', async () => {
    const result = await suggestTaskDetails('Fix urgent database indexing bug');

    assert.ok(result.description);
    assert.ok(result.suggestedPriority);
    assert.ok(result.engine);
    // Security check: backend API keys or secrets are never returned in response payload
    assert.strictEqual(result.apiKey, undefined);
    assert.strictEqual(result.GEMINI_API_KEY, undefined);
    assert.strictEqual(result.OPENAI_API_KEY, undefined);
  });

});
