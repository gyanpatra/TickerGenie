/**
 * Tests for API Service
 */

import { analyzeVideo, sendResultsEmail, getLatestVideo } from '../services/api';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('API Service', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('analyzeVideo', () => {
    it('should call the analyze endpoint with video URL', async () => {
      const mockResponse = {
        id: 'analysis_123',
        videoUrl: 'https://www.youtube.com/watch?v=abc123',
        videoTitle: 'Test Video',
        channelName: 'Test Channel',
        extractedTickers: ['AAPL', 'MSFT'],
        tickerRatings: [],
        topPicks: [],
        analysisDate: new Date().toISOString(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await analyzeVideo('https://www.youtube.com/watch?v=abc123');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/analyze'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoUrl: 'https://www.youtube.com/watch?v=abc123' }),
        })
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Invalid video URL' }),
      });

      const result = await analyzeVideo('invalid-url');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid video URL');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await analyzeVideo('https://www.youtube.com/watch?v=abc123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('sendResultsEmail', () => {
    const mockResults = {
      id: 'analysis_123',
      videoUrl: 'https://www.youtube.com/watch?v=abc123',
      videoTitle: 'Test Video',
      channelName: 'Test Channel',
      extractedTickers: ['AAPL'],
      tickerRatings: [],
      topPicks: [],
      analysisDate: new Date().toISOString(),
    };

    it('should call the email endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ messageId: 'msg_123' }),
      });

      const result = await sendResultsEmail({
        email: 'test@example.com',
        results: mockResults,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/email'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );

      expect(result.success).toBe(true);
    });

    it('should handle email errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Invalid email' }),
      });

      const result = await sendResultsEmail({
        email: 'invalid',
        results: mockResults,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid email');
    });
  });

  describe('getLatestVideo', () => {
    it('should call the latest-video endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ videoUrl: 'https://www.youtube.com/watch?v=latest' }),
      });

      const result = await getLatestVideo('https://www.youtube.com/@morningstar');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/latest-video'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channelUrl: 'https://www.youtube.com/@morningstar' }),
        })
      );

      expect(result.success).toBe(true);
      expect(result.data?.videoUrl).toBe('https://www.youtube.com/watch?v=latest');
    });

    it('should handle channel not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Channel not found' }),
      });

      const result = await getLatestVideo('https://www.youtube.com/@nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Channel not found');
    });
  });
});
