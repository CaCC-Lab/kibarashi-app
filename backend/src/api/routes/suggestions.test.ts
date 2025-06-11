import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { router } from './suggestions';

vi.mock('../controllers/suggestionController', () => ({
  getSuggestions: vi.fn((req, res) => {
    res.json({
      suggestions: [
        { id: '1', title: 'Test', description: 'Test', duration: 5, category: 'cognitive' }
      ]
    });
  })
}));

describe('Suggestions Routes', () => {
  const app = express();
  app.use('/api/v1/suggestions', router);

  it('GET /api/v1/suggestions should return suggestions', async () => {
    const response = await request(app)
      .get('/api/v1/suggestions')
      .query({ situation: 'office', duration: 5 });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('suggestions');
    expect(response.body.suggestions).toHaveLength(1);
  });
});