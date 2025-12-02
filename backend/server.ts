/**
 * Express Server for Local Development
 * Provides REST API endpoints for TickerGenie
 */

import express, { Request, Response } from 'express';
import { extractVideoId, getVideoMetadata, fetchTranscript, getLatestVideoFromChannel } from './lib/youtubeService';
import { extractTickers } from './lib/tickerExtractor';
import { fetchMultipleRatings, getTopPicks, AnalystRating } from './lib/yahooFinance';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// CORS middleware
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (_req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

/**
 * Validate YouTube channel URL
 */
function isValidYouTubeChannelUrl(url: string): boolean {
  const patterns = [
    /youtube\.com\/@[a-zA-Z0-9_-]+/,
    /youtube\.com\/channel\/[a-zA-Z0-9_-]+/,
    /youtube\.com\/user\/[a-zA-Z0-9_-]+/,
    /youtube\.com\/c\/[a-zA-Z0-9_-]+/,
  ];
  return patterns.some(pattern => pattern.test(url));
}

/**
 * Generate unique analysis ID
 */
function generateId(): string {
  return `analysis_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Interface for analyze-channel response
interface AnalyzeChannelResponse {
  channelUrl: string;
  channelName: string;
  latestVideoId: string;
  latestVideoTitle: string;
  tickers: string[];
  topTickers: Array<{
    ticker: string;
    rating: string;
    source: string;
  }>;
}

/**
 * POST /api/analyze-channel
 * Analyzes the latest video from a YouTube channel for stock tickers
 */
app.post('/api/analyze-channel', async (req: Request, res: Response) => {
  try {
    const { channelUrl } = req.body;

    // Validate channelUrl
    if (!channelUrl || typeof channelUrl !== 'string') {
      return res.status(400).json({ message: 'channelUrl is required' });
    }

    if (!isValidYouTubeChannelUrl(channelUrl)) {
      return res.status(400).json({ message: 'Invalid YouTube channel URL' });
    }

    // Get latest video from channel
    const latestVideoUrl = await getLatestVideoFromChannel(channelUrl);
    if (!latestVideoUrl) {
      return res.status(404).json({ message: 'Could not find any videos on this channel' });
    }

    // Extract video ID
    const videoId = extractVideoId(latestVideoUrl);
    if (!videoId) {
      return res.status(400).json({ message: 'Could not extract video ID' });
    }

    // Get video metadata
    const metadata = await getVideoMetadata(videoId);

    // Fetch transcript
    let transcript: string;
    try {
      transcript = await fetchTranscript(videoId);
    } catch {
      return res.status(400).json({
        message: 'Could not fetch video transcript. The video may not have captions available.',
      });
    }

    // Extract tickers from transcript
    const tickers = extractTickers(transcript);

    if (tickers.length === 0) {
      const response: AnalyzeChannelResponse = {
        channelUrl,
        channelName: metadata.channelName,
        latestVideoId: videoId,
        latestVideoTitle: metadata.title,
        tickers: [],
        topTickers: [],
      };
      return res.json(response);
    }

    // Fetch ratings for all tickers
    const tickerRatings = await fetchMultipleRatings(tickers);

    // Get top 5 tickers
    const top5 = getTopPicks(tickerRatings, 5);

    // Format top tickers for response
    const topTickers = top5.map(rating => ({
      ticker: rating.ticker,
      rating: rating.rating === 'Unknown' ? 'No rating found on Yahoo Finance.' : rating.rating,
      source: 'Yahoo Finance',
    }));

    const response: AnalyzeChannelResponse = {
      channelUrl,
      channelName: metadata.channelName,
      latestVideoId: videoId,
      latestVideoTitle: metadata.title,
      tickers,
      topTickers,
    };

    return res.json(response);
  } catch (error) {
    console.error('Error analyzing channel:', error);
    return res.status(500).json({
      message: 'An error occurred while analyzing the channel',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Interface for email-results request
interface EmailResultsRequest {
  email: string;
  analysis: {
    channelUrl: string;
    channelName: string;
    latestVideoTitle: string;
    tickers: string[];
    topTickers: Array<{
      ticker: string;
      rating: string;
      source: string;
    }>;
  };
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/email-results
 * Sends analysis results via email
 */
app.post('/api/email-results', async (req: Request, res: Response) => {
  try {
    const { email, analysis } = req.body as EmailResultsRequest;

    // Validate email
    if (!email || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: 'Valid email address is required' });
    }

    // Validate analysis
    if (!analysis) {
      return res.status(400).json({ message: 'Analysis results are required' });
    }

    // In development mode, just mock the email sending
    // In production, this would use AWS SES
    const isDevelopment = process.env.NODE_ENV !== 'production';

    if (isDevelopment) {
      console.log(`[DEV] Would send email to: ${email}`);
      console.log(`[DEV] Analysis data:`, JSON.stringify(analysis, null, 2));
      
      return res.json({
        message: 'Email sent successfully (development mode)',
        messageId: `dev_${Date.now()}`,
      });
    }

    // Production: Use AWS SES
    // Import dynamically to avoid requiring AWS SDK in dev
    const { sendResultsEmail } = await import('./lib/emailService');
    
    // Convert to email service format
    const emailContent = {
      videoTitle: analysis.latestVideoTitle,
      channelName: analysis.channelName,
      videoUrl: analysis.channelUrl,
      analysisDate: new Date().toISOString(),
      extractedTickers: analysis.tickers,
      topPicks: analysis.topTickers.map(t => ({
        ticker: t.ticker,
        companyName: t.ticker, // Will be filled by ratings
        currentPrice: null,
        targetPrice: null,
        rating: t.rating,
        numberOfAnalysts: 0,
        recommendationTrend: 'unknown' as const,
        upside: null,
      })),
      allRatings: [],
    };

    const result = await sendResultsEmail(email, emailContent);
    
    return res.json({
      message: 'Email sent successfully',
      messageId: result.messageId,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({
      message: 'An error occurred while sending the email',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Legacy endpoint: POST /analyze
 * For backwards compatibility with existing frontend
 */
app.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { videoUrl } = req.body;

    if (!videoUrl) {
      return res.status(400).json({ message: 'videoUrl is required' });
    }

    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      return res.status(400).json({ message: 'Invalid YouTube video URL' });
    }

    const metadata = await getVideoMetadata(videoId);

    let transcript: string;
    try {
      transcript = await fetchTranscript(videoId);
    } catch {
      return res.status(400).json({
        message: 'Could not fetch video transcript. The video may not have captions available.',
      });
    }

    const extractedTickers = extractTickers(transcript);

    if (extractedTickers.length === 0) {
      return res.json({
        id: generateId(),
        videoUrl,
        videoTitle: metadata.title,
        channelName: metadata.channelName,
        extractedTickers: [],
        tickerRatings: [],
        topPicks: [],
        analysisDate: new Date().toISOString(),
        message: 'No stock tickers found in the video transcript',
      });
    }

    const tickerRatings = await fetchMultipleRatings(extractedTickers);
    const topPicks = getTopPicks(tickerRatings, 5);

    return res.json({
      id: generateId(),
      videoUrl,
      videoTitle: metadata.title,
      channelName: metadata.channelName,
      extractedTickers,
      tickerRatings,
      topPicks,
      analysisDate: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({
      message: 'An error occurred while processing the video',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Legacy endpoint: POST /latest-video
 */
app.post('/latest-video', async (req: Request, res: Response) => {
  try {
    const { channelUrl } = req.body;

    if (!channelUrl) {
      return res.status(400).json({ message: 'channelUrl is required' });
    }

    const videoUrl = await getLatestVideoFromChannel(channelUrl);

    if (!videoUrl) {
      return res.status(404).json({ message: 'Could not find any videos on this channel' });
    }

    return res.json({ videoUrl });
  } catch (error) {
    console.error('Error getting latest video:', error);
    return res.status(500).json({
      message: 'An error occurred while fetching the latest video',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Legacy endpoint: POST /email
 */
app.post('/email', async (req: Request, res: Response) => {
  try {
    const { email, results } = req.body;

    if (!email || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: 'Valid email address is required' });
    }

    if (!results) {
      return res.status(400).json({ message: 'Analysis results are required' });
    }

    // Development mode mock
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV] Would send email to: ${email}`);
      return res.json({
        message: 'Email sent successfully (development mode)',
        messageId: `dev_${Date.now()}`,
      });
    }

    const { sendResultsEmail } = await import('./lib/emailService');

    const emailContent = {
      videoTitle: results.videoTitle,
      channelName: results.channelName,
      videoUrl: results.videoUrl,
      analysisDate: results.analysisDate,
      extractedTickers: results.extractedTickers,
      topPicks: results.topPicks,
      allRatings: results.tickerRatings,
    };

    const result = await sendResultsEmail(email, emailContent);

    return res.json({
      message: 'Email sent successfully',
      messageId: result.messageId,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({
      message: 'An error occurred while sending the email',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server if run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🧞 TickerGenie API server running on port ${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/health`);
    console.log(`   API endpoints:`);
    console.log(`   - POST /api/analyze-channel`);
    console.log(`   - POST /api/email-results`);
    console.log(`   - POST /analyze (legacy)`);
    console.log(`   - POST /latest-video (legacy)`);
    console.log(`   - POST /email (legacy)`);
  });
}

export { app };
