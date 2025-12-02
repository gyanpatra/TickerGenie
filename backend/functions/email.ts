/**
 * Email Results Lambda Handler
 * Sends analysis results via email using AWS SES
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { sendResultsEmail, EmailResult } from '../lib/emailService';
import { AnalystRating } from '../lib/yahooFinance';

interface EmailRequest {
  email: string;
  results: {
    id: string;
    videoUrl: string;
    videoTitle: string;
    channelName: string;
    extractedTickers: string[];
    tickerRatings: AnalystRating[];
    topPicks: AnalystRating[];
    analysisDate: string;
  };
}

// CORS headers
const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

    const request: EmailRequest = JSON.parse(event.body);
    
    // Validate email
    if (!request.email || !EMAIL_REGEX.test(request.email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Valid email address is required' }),
      };
    }

    // Validate results
    if (!request.results) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Analysis results are required' }),
      };
    }

    // Prepare email content
    const emailContent: EmailResult = {
      videoTitle: request.results.videoTitle,
      channelName: request.results.channelName,
      videoUrl: request.results.videoUrl,
      analysisDate: request.results.analysisDate,
      extractedTickers: request.results.extractedTickers,
      topPicks: request.results.topPicks,
      allRatings: request.results.tickerRatings,
    };

    // Send email
    const result = await sendResultsEmail(request.email, emailContent);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        message: 'Email sent successfully',
        messageId: result.messageId
      }),
    };
  } catch (error) {
    console.error('Error sending email:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        message: 'An error occurred while sending the email',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};
