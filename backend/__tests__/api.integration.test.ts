/**
 * Integration Tests for API Endpoints
 * Using Supertest to test Express routes with mocked services
 */

import request from 'supertest';
import { app } from '../server';

// Mock the external services
jest.mock('../lib/youtubeService', () => ({
  extractVideoId: jest.fn((url: string) => {
    if (url.includes('invalid')) return null;
    return 'mockVideoId123';
  }),
  extractChannelId: jest.fn((url: string) => {
    if (url.includes('invalid')) return null;
    return 'mockChannelId';
  }),
  getVideoMetadata: jest.fn().mockResolvedValue({
    title: 'Mock Video Title - Stock Analysis',
    channelName: 'Mock Finance Channel',
    publishedAt: '2024-01-15T10:00:00Z',
  }),
  fetchTranscript: jest.fn().mockResolvedValue(
    'Today we are looking at AAPL, Apple is a great company. Also MSFT Microsoft and NVDA Nvidia are top picks. TSLA Tesla has potential too.'
  ),
  getLatestVideoFromChannel: jest.fn().mockImplementation((url: string) => {
    if (url.includes('invalid')) return Promise.resolve(null);
    if (url.includes('novideos')) return Promise.resolve(null);
    return Promise.resolve('https://www.youtube.com/watch?v=mockVideoId123');
  }),
}));

jest.mock('../lib/yahooFinance', () => ({
  fetchMultipleRatings: jest.fn().mockResolvedValue([
    {
      ticker: 'AAPL',
      companyName: 'Apple Inc.',
      currentPrice: 180.50,
      targetPrice: 200.00,
      rating: 'Buy',
      numberOfAnalysts: 35,
      recommendationTrend: 'buy',
      upside: 10.8,
    },
    {
      ticker: 'MSFT',
      companyName: 'Microsoft Corporation',
      currentPrice: 370.00,
      targetPrice: 420.00,
      rating: 'Strong Buy',
      numberOfAnalysts: 40,
      recommendationTrend: 'strongBuy',
      upside: 13.5,
    },
    {
      ticker: 'NVDA',
      companyName: 'NVIDIA Corporation',
      currentPrice: 480.00,
      targetPrice: 550.00,
      rating: 'Buy',
      numberOfAnalysts: 42,
      recommendationTrend: 'buy',
      upside: 14.6,
    },
    {
      ticker: 'TSLA',
      companyName: 'Tesla, Inc.',
      currentPrice: 250.00,
      targetPrice: 280.00,
      rating: 'Hold',
      numberOfAnalysts: 38,
      recommendationTrend: 'hold',
      upside: 12.0,
    },
  ]),
  getTopPicks: jest.fn().mockImplementation((ratings, count = 5) => {
    return ratings.slice(0, count);
  }),
}));

describe('API Endpoints', () => {
  describe('POST /api/analyze-channel', () => {
    it('should return 400 if channelUrl is missing', async () => {
      const response = await request(app)
        .post('/api/analyze-channel')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('channelUrl is required');
    });

    it('should return 400 for invalid YouTube channel URL', async () => {
      const response = await request(app)
        .post('/api/analyze-channel')
        .send({ channelUrl: 'https://example.com/not-youtube' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid YouTube channel URL');
    });

    it('should return 404 if no videos found on channel', async () => {
      const response = await request(app)
        .post('/api/analyze-channel')
        .send({ channelUrl: 'https://www.youtube.com/@novideos' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Could not find any videos on this channel');
    });

    it('should successfully analyze a valid channel URL', async () => {
      const response = await request(app)
        .post('/api/analyze-channel')
        .send({ channelUrl: 'https://www.youtube.com/@morningstar' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('channelUrl');
      expect(response.body).toHaveProperty('channelName');
      expect(response.body).toHaveProperty('latestVideoId');
      expect(response.body).toHaveProperty('latestVideoTitle');
      expect(response.body).toHaveProperty('tickers');
      expect(response.body).toHaveProperty('topTickers');
      expect(Array.isArray(response.body.tickers)).toBe(true);
      expect(Array.isArray(response.body.topTickers)).toBe(true);
    });

    it('should return correct response shape with tickers', async () => {
      const response = await request(app)
        .post('/api/analyze-channel')
        .send({ channelUrl: 'https://www.youtube.com/@morningstar' });

      expect(response.status).toBe(200);
      
      // Check tickers array contains extracted tickers
      expect(response.body.tickers).toContain('AAPL');
      expect(response.body.tickers).toContain('MSFT');
      expect(response.body.tickers).toContain('NVDA');
      expect(response.body.tickers).toContain('TSLA');

      // Check topTickers have correct structure
      expect(response.body.topTickers.length).toBeGreaterThan(0);
      expect(response.body.topTickers[0]).toHaveProperty('ticker');
      expect(response.body.topTickers[0]).toHaveProperty('rating');
      expect(response.body.topTickers[0]).toHaveProperty('source');
      expect(response.body.topTickers[0].source).toBe('Yahoo Finance');
    });
  });

  describe('POST /api/email-results', () => {
    const validAnalysis = {
      channelUrl: 'https://www.youtube.com/@morningstar',
      channelName: 'Morningstar',
      latestVideoTitle: 'Top Stock Picks for 2024',
      tickers: ['AAPL', 'MSFT', 'NVDA'],
      topTickers: [
        { ticker: 'AAPL', rating: 'Buy', source: 'Yahoo Finance' },
        { ticker: 'MSFT', rating: 'Strong Buy', source: 'Yahoo Finance' },
      ],
    };

    it('should return 400 if email is missing', async () => {
      const response = await request(app)
        .post('/api/email-results')
        .send({ analysis: validAnalysis });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Valid email address is required');
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/email-results')
        .send({ email: 'invalid-email', analysis: validAnalysis });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Valid email address is required');
    });

    it('should return 400 if analysis is missing', async () => {
      const response = await request(app)
        .post('/api/email-results')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Analysis results are required');
    });

    it('should successfully send email in development mode', async () => {
      const response = await request(app)
        .post('/api/email-results')
        .send({
          email: 'test@example.com',
          analysis: validAnalysis,
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Email sent successfully');
      expect(response.body).toHaveProperty('messageId');
    });
  });

  describe('Legacy Endpoints', () => {
    describe('POST /analyze', () => {
      it('should return 400 if videoUrl is missing', async () => {
        const response = await request(app)
          .post('/analyze')
          .send({});

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('videoUrl is required');
      });

      it('should successfully analyze a video', async () => {
        const response = await request(app)
          .post('/analyze')
          .send({ videoUrl: 'https://www.youtube.com/watch?v=abc123' });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('videoUrl');
        expect(response.body).toHaveProperty('videoTitle');
        expect(response.body).toHaveProperty('channelName');
        expect(response.body).toHaveProperty('extractedTickers');
        expect(response.body).toHaveProperty('tickerRatings');
        expect(response.body).toHaveProperty('topPicks');
        expect(response.body).toHaveProperty('analysisDate');
      });
    });

    describe('POST /latest-video', () => {
      it('should return 400 if channelUrl is missing', async () => {
        const response = await request(app)
          .post('/latest-video')
          .send({});

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('channelUrl is required');
      });

      it('should return latest video URL for valid channel', async () => {
        const response = await request(app)
          .post('/latest-video')
          .send({ channelUrl: 'https://www.youtube.com/@morningstar' });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('videoUrl');
      });
    });

    describe('POST /email', () => {
      it('should return 400 for invalid email', async () => {
        const response = await request(app)
          .post('/email')
          .send({ email: 'invalid', results: {} });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Valid email address is required');
      });

      it('should return 400 if results are missing', async () => {
        const response = await request(app)
          .post('/email')
          .send({ email: 'test@example.com' });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Analysis results are required');
      });
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });
});
