// Types for TickerGenie application

export interface YouTubeAnalyst {
  id: string;
  name: string;
  channelUrl: string;
}

export interface TickerRating {
  ticker: string;
  companyName: string;
  currentPrice: number | null;
  targetPrice: number | null;
  rating: string;
  numberOfAnalysts: number;
  recommendationTrend: 'strongBuy' | 'buy' | 'hold' | 'sell' | 'strongSell' | 'unknown';
  upside: number | null;
}

export interface AnalysisResult {
  id: string;
  videoUrl: string;
  videoTitle: string;
  channelName: string;
  extractedTickers: string[];
  tickerRatings: TickerRating[];
  topPicks: TickerRating[];
  analysisDate: string;
}

export interface EmailRequest {
  email: string;
  results: AnalysisResult;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const DEFAULT_ANALYSTS: YouTubeAnalyst[] = [
  {
    id: 'morningstar',
    name: 'Morningstar',
    channelUrl: 'https://www.youtube.com/@MorningstarInc',
  },
  {
    id: 'seekingalpha',
    name: 'Seeking Alpha',
    channelUrl: 'https://www.youtube.com/@SeekingAlpha',
  },
  {
    id: 'motley-fool',
    name: 'The Motley Fool',
    channelUrl: 'https://www.youtube.com/@MotleyFool',
  },
  {
    id: 'cnbc',
    name: 'CNBC',
    channelUrl: 'https://www.youtube.com/@CNBC',
  },
  {
    id: 'custom',
    name: 'Custom URL',
    channelUrl: '',
  },
];
