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
 * Decode HTML entities in a string
 * Order matters to avoid double-decoding issues
 */
function decodeHtmlEntities(text: string): string {
  // First decode numeric entities
  let decoded = text.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));
  // Then decode named entities (decode &amp; last to avoid double-decoding)
  decoded = decoded.replace(/&lt;/g, '<');
  decoded = decoded.replace(/&gt;/g, '>');
  decoded = decoded.replace(/&quot;/g, '"');
  decoded = decoded.replace(/&apos;/g, "'");
  decoded = decoded.replace(/&nbsp;/g, ' ');
  // Decode &amp; last to prevent double-decoding of other entities
  decoded = decoded.replace(/&amp;/g, '&');
  return decoded;
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
    // Fetch the video page to get the initial data
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
    
    // Extract caption tracks from the page data
    // Look for the timedtext URL in the page source
    const captionUrlMatch = html.match(/"captionTracks":\s*\[(.*?)\]/s);
    
    if (!captionUrlMatch) {
      throw new Error('No captions available for this video');
    }

    // Parse caption tracks to find English captions
    const captionData = captionUrlMatch[1];
    const baseUrlMatch = captionData.match(/"baseUrl":\s*"([^"]+)"/);
    
    if (!baseUrlMatch) {
      throw new Error('Could not find caption URL');
    }

    // Decode the URL (it's escaped in the JSON)
    const captionUrl = baseUrlMatch[1].replace(/\\u0026/g, '&').replace(/\\\//g, '/');
    
    // Fetch the actual transcript
    const transcriptResponse = await fetch(captionUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!transcriptResponse.ok) {
      throw new Error(`Failed to fetch transcript: ${transcriptResponse.status}`);
    }

    const transcriptXml = await transcriptResponse.text();
    
    // Extract text from XML transcript
    // The transcript is in XML format with <text> tags
    const textMatches = transcriptXml.matchAll(/<text[^>]*>([^<]*)<\/text>/g);
    const transcriptParts: string[] = [];
    
    for (const match of textMatches) {
      // Decode HTML entities - use a helper function to avoid double-escaping issues
      const text = decodeHtmlEntities(match[1]).trim();
      
      if (text) {
        transcriptParts.push(text);
      }
    }

    if (transcriptParts.length === 0) {
      throw new Error('Transcript is empty');
    }

    return transcriptParts.join(' ');
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
