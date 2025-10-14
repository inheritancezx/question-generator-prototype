import handler from '../generate-questions';
import { createMocks } from 'node-mocks-http';

describe('/api/generate-questions', () => {
  test('returns 405 for non-POST requests', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Method not allowed',
    });
  });

  test('returns 400 when theme is missing', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {},
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Theme is required',
    });
  });

  test('returns questions when valid theme provided', async () => {
    const mockQuestions = ['Question 1?', 'Question 2?'];
    const Ollama = require('ollama');
    Ollama.__chatMock.mockResolvedValue({
      message: { content: JSON.stringify(mockQuestions) },
    });

    const { req, res } = createMocks({
      method: 'POST',
      body: { theme: 'space exploration' },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      questions: mockQuestions,
    });
  });
});