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
    channelUrl: 'https://www.youtube.com/@morningstar',
  },
  {
    id: 'markroussin',
    name: 'Mark Roussin CPA',
    channelUrl: 'https://www.youtube.com/@MarkRoussinCPA',
  },
  {
    id: 'nolangouveia',
    name: 'Nolan Gouveia',
    channelUrl: 'https://www.youtube.com/@NolanGouveia',
  },
  {
    id: 'custom',
    name: 'Custom URL',
    channelUrl: '',
  },
];
