/**
 * YouTube Service
 * Fetches video transcripts and latest videos from channels
 */

import fetch from 'node-fetch';

interface TranscriptSegment {
  text: string;
  duration: number;
  offset: number;
}

/**
 * Extract video ID from various YouTube URL formats
 */
export function extractVideoId(url: string): string | null {
  // Handle various YouTube URL formats
  const patterns = [
    // Standard watch URL
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    // Shorts URL
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    // Live URL
    /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * Extract channel ID/handle from YouTube channel URL
 */
export function extractChannelId(url: string): string | null {
  const patterns = [
    // Handle URL (@username)
    /youtube\.com\/@([a-zA-Z0-9_-]+)/,
    // Channel ID URL
    /youtube\.com\/channel\/([a-zA-Z0-9_-]+)/,
    // User URL (legacy)
    /youtube\.com\/user\/([a-zA-Z0-9_-]+)/,
    // Custom URL
    /youtube\.com\/c\/([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * Fetch video transcript using youtube-transcript library
 * This is a simplified version - in production, you'd use the actual youtube-transcript package
 */
export async function fetchTranscript(videoId: string): Promise<string> {
  try {
    // In production, use the youtube-transcript package:
    // import { YoutubeTranscript } from 'youtube-transcript';
    // const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    
    // For now, we'll use a direct API approach
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    
    // Fetch the video page to get the initial data
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch video page: ${response.status}`);
    }

    const html = await response.text();
    
    // Extract caption tracks from the page data
    const captionMatch = html.match(/"captions":\s*(\{[^}]+\})/);
    
    if (!captionMatch) {
      throw new Error('No captions available for this video');
    }

    // In a real implementation, you would parse the caption URL and fetch the transcript
    // For this simplified version, we'll return a placeholder
    // The actual implementation should use the youtube-transcript package
    
    throw new Error('Transcript extraction requires youtube-transcript package');
  } catch (error) {
    console.error(`Error fetching transcript for ${videoId}:`, error);
    throw error;
  }
}

/**
 * Get video metadata including title and channel name
 */
export async function getVideoMetadata(videoId: string): Promise<{
  title: string;
  channelName: string;
  publishedAt: string;
}> {
  try {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch video page: ${response.status}`);
    }

    const html = await response.text();
    
    // Extract title
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    const title = titleMatch 
      ? titleMatch[1].replace(' - YouTube', '').trim()
      : 'Unknown Title';
    
    // Extract channel name from meta tags
    const channelMatch = html.match(/<link itemprop="name" content="([^"]+)">/);
    const channelName = channelMatch ? channelMatch[1] : 'Unknown Channel';
    
    // Extract publish date
    const dateMatch = html.match(/"publishDate":"([^"]+)"/);
    const publishedAt = dateMatch ? dateMatch[1] : new Date().toISOString();

    return { title, channelName, publishedAt };
  } catch (error) {
    console.error(`Error fetching metadata for ${videoId}:`, error);
    return {
      title: 'Unknown Title',
      channelName: 'Unknown Channel',
      publishedAt: new Date().toISOString(),
    };
  }
}

/**
 * Get the latest video URL from a YouTube channel
 */
export async function getLatestVideoFromChannel(channelUrl: string): Promise<string | null> {
  try {
    const channelId = extractChannelId(channelUrl);
    if (!channelId) {
      throw new Error('Invalid channel URL');
    }

    // Construct the videos page URL
    let videosUrl: string;
    if (channelUrl.includes('@')) {
      videosUrl = `https://www.youtube.com/@${channelId}/videos`;
    } else {
      videosUrl = `https://www.youtube.com/channel/${channelId}/videos`;
    }

    const response = await fetch(videosUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch channel page: ${response.status}`);
    }

    const html = await response.text();
    
    // Extract the first video ID from the page
    const videoMatch = html.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/);
    
    if (videoMatch) {
      return `https://www.youtube.com/watch?v=${videoMatch[1]}`;
    }

    throw new Error('No videos found on channel');
  } catch (error) {
    console.error(`Error getting latest video from channel:`, error);
    return null;
  }
}

export default {
  extractVideoId,
  extractChannelId,
  fetchTranscript,
  getVideoMetadata,
  getLatestVideoFromChannel,
};
