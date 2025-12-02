/**
 * Latest Video Lambda Handler
 * Gets the latest video from a YouTube channel
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getLatestVideoFromChannel } from '../lib/youtubeService';

interface LatestVideoRequest {
  channelUrl: string;
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

    const request: LatestVideoRequest = JSON.parse(event.body);
    
    if (!request.channelUrl) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'channelUrl is required' }),
      };
    }

    // Get latest video from channel
    const videoUrl = await getLatestVideoFromChannel(request.channelUrl);
    
    if (!videoUrl) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ message: 'Could not find any videos on this channel' }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ videoUrl }),
    };
  } catch (error) {
    console.error('Error getting latest video:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        message: 'An error occurred while fetching the latest video',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};
