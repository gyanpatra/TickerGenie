// API Service for TickerGenie
import { AnalysisResult, ApiResponse, EmailRequest } from '../types';

// API Base URL - replace with actual AWS API Gateway URL when deployed
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.tickergenie.com';

export const analyzeVideo = async (videoUrl: string): Promise<ApiResponse<AnalysisResult>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ videoUrl }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.message || 'Failed to analyze video' };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Network error occurred' 
    };
  }
};

export const sendResultsEmail = async (request: EmailRequest): Promise<ApiResponse<{ messageId: string }>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.message || 'Failed to send email' };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Network error occurred' 
    };
  }
};

export const getLatestVideo = async (channelUrl: string): Promise<ApiResponse<{ videoUrl: string }>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/latest-video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ channelUrl }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.message || 'Failed to get latest video' };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Network error occurred' 
    };
  }
};

export default {
  analyzeVideo,
  sendResultsEmail,
  getLatestVideo,
};
