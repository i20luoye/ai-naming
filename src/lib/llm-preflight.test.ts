import test from 'node:test';
import assert from 'node:assert/strict';
import { checkLlmPreflight, LLM_REQUIRED_ENV_KEYS } from './llm/preflight';

test('LLM preflight returns ok=false when required credentials are missing', () => {
  const result = checkLlmPreflight({});

  assert.equal(result.ok, false);
  assert.equal(result.reason, 'LLM_CREDENTIALS_MISSING');
  assert.deepEqual(result.missingKeys, LLM_REQUIRED_ENV_KEYS);
});

test('LLM preflight passes when required SDK configuration is present', () => {
  const result = checkLlmPreflight({
    LLM_API_KEY: 'test-key',
    LLM_BASE_URL: 'https://model.example.test/v1',
  });

  assert.equal(result.ok, true);
  assert.equal(result.reason, undefined);
  assert.equal(result.missingKeys, undefined);
});

test('LLM config maps generic app env to the OpenAI-compatible client shape', async () => {
  const { getLlmConfig, getLlmModel } = await import('./llm/preflight');
  const config = getLlmConfig({
    LLM_API_KEY: 'test-key',
    LLM_BASE_URL: 'https://model.example.test/v1',
  });

  assert.equal(config.apiKey, 'test-key');
  assert.equal(config.baseUrl, 'https://model.example.test/v1');
  assert.equal(getLlmModel({}), 'agnes-2.0-flash');
  assert.equal(getLlmModel({ LLM_MODEL: 'custom-model' }), 'custom-model');
});
