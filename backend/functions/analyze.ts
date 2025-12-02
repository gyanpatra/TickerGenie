/**
 * Analyze Video Lambda Handler
 * Main entry point for video analysis
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { extractVideoId, getVideoMetadata, fetchTranscript } from '../lib/youtubeService';
import { extractTickers } from '../lib/tickerExtractor';
import { fetchMultipleRatings, getTopPicks, AnalystRating } from '../lib/yahooFinance';

interface AnalysisRequest {
  videoUrl: string;
}

interface AnalysisResponse {
  id: string;
  videoUrl: string;
  videoTitle: string;
  channelName: string;
  extractedTickers: string[];
  tickerRatings: AnalystRating[];
  topPicks: AnalystRating[];
  analysisDate: string;
}

// CORS headers
const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    // Parse request body
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Request body is required' }),
      };
    }

    const request: AnalysisRequest = JSON.parse(event.body);
    
    if (!request.videoUrl) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'videoUrl is required' }),
      };
    }

    // Extract video ID
    const videoId = extractVideoId(request.videoUrl);
    if (!videoId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Invalid YouTube video URL' }),
      };
    }

    // Get video metadata
    const metadata = await getVideoMetadata(videoId);

    // Fetch transcript
    let transcript: string;
    try {
      transcript = await fetchTranscript(videoId);
    } catch {
      // If transcript fails, we can still return partial results
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          message: 'Could not fetch video transcript. The video may not have captions available.' 
        }),
      };
    }

    // Extract tickers from transcript
    const extractedTickers = extractTickers(transcript);
    
    if (extractedTickers.length === 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          id: generateId(),
          videoUrl: request.videoUrl,
          videoTitle: metadata.title,
          channelName: metadata.channelName,
          extractedTickers: [],
          tickerRatings: [],
          topPicks: [],
          analysisDate: new Date().toISOString(),
          message: 'No stock tickers found in the video transcript',
        }),
      };
    }

    // Fetch ratings for all tickers
    const tickerRatings = await fetchMultipleRatings(extractedTickers);
    
    // Get top 5 picks
    const topPicks = getTopPicks(tickerRatings, 5);

    const response: AnalysisResponse = {
      id: generateId(),
      videoUrl: request.videoUrl,
      videoTitle: metadata.title,
      channelName: metadata.channelName,
      extractedTickers,
      tickerRatings,
      topPicks,
      analysisDate: new Date().toISOString(),
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error('Error processing request:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        message: 'An error occurred while processing the video',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};

function generateId(): string {
  return `analysis_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
