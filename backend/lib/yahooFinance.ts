/**
 * Yahoo Finance Service
 * Fetches analyst ratings for stock tickers
 */

import fetch from 'node-fetch';

export interface AnalystRating {
  ticker: string;
  companyName: string;
  currentPrice: number | null;
  targetPrice: number | null;
  rating: string;
  numberOfAnalysts: number;
  recommendationTrend: 'strongBuy' | 'buy' | 'hold' | 'sell' | 'strongSell' | 'unknown';
  upside: number | null;
}

interface YahooQuoteResponse {
  quoteSummary?: {
    result?: Array<{
      price?: {
        shortName?: string;
        regularMarketPrice?: { raw?: number };
      };
      financialData?: {
        targetMeanPrice?: { raw?: number };
        recommendationKey?: string;
        numberOfAnalystOpinions?: { raw?: number };
      };
    }>;
    error?: { code?: string; description?: string };
  };
}

/**
 * Fetch analyst rating for a single ticker from Yahoo Finance
 */
export async function fetchTickerRating(ticker: string): Promise<AnalystRating | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=price,financialData`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      console.warn(`Failed to fetch data for ${ticker}: ${response.status}`);
      return null;
    }

    const data = (await response.json()) as YahooQuoteResponse;
    
    if (!data.quoteSummary?.result?.[0]) {
      return null;
    }

    const result = data.quoteSummary.result[0];
    const price = result.price;
    const financialData = result.financialData;

    const currentPrice = price?.regularMarketPrice?.raw ?? null;
    const targetPrice = financialData?.targetMeanPrice?.raw ?? null;
    const recommendationKey = financialData?.recommendationKey || 'unknown';
    
    // Calculate upside percentage
    let upside: number | null = null;
    if (currentPrice && targetPrice) {
      upside = ((targetPrice - currentPrice) / currentPrice) * 100;
    }

    // Map recommendation key to display text
    const ratingMap: Record<string, string> = {
      'strong_buy': 'Strong Buy',
      'buy': 'Buy',
      'hold': 'Hold',
      'underperform': 'Sell',
      'sell': 'Strong Sell',
    };

    // Map to trend enum
    const trendMap: Record<string, AnalystRating['recommendationTrend']> = {
      'strong_buy': 'strongBuy',
      'buy': 'buy',
      'hold': 'hold',
      'underperform': 'sell',
      'sell': 'strongSell',
    };

    return {
      ticker,
      companyName: price?.shortName || ticker,
      currentPrice,
      targetPrice,
      rating: ratingMap[recommendationKey] || 'Unknown',
      numberOfAnalysts: financialData?.numberOfAnalystOpinions?.raw ?? 0,
      recommendationTrend: trendMap[recommendationKey] || 'unknown',
      upside,
    };
  } catch (error) {
    console.error(`Error fetching rating for ${ticker}:`, error);
    return null;
  }
}

/**
 * Fetch analyst ratings for multiple tickers
 */
export async function fetchMultipleRatings(tickers: string[]): Promise<AnalystRating[]> {
  // Fetch in parallel with rate limiting (5 at a time)
  const results: AnalystRating[] = [];
  const batchSize = 5;
  
  for (let i = 0; i < tickers.length; i += batchSize) {
    const batch = tickers.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(ticker => fetchTickerRating(ticker))
    );
    
    for (const result of batchResults) {
      if (result) {
        results.push(result);
      }
    }
    
    // Small delay between batches to avoid rate limiting
    if (i + batchSize < tickers.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  return results;
}

/**
 * Get top 5 picks based on analyst ratings and upside potential
 */
export function getTopPicks(ratings: AnalystRating[], count: number = 5): AnalystRating[] {
  // Score each ticker based on rating and upside
  const scored = ratings.map(rating => {
    let score = 0;
    
    // Rating score (higher is better)
    const ratingScores: Record<string, number> = {
      'strongBuy': 5,
      'buy': 4,
      'hold': 3,
      'sell': 2,
      'strongSell': 1,
      'unknown': 0,
    };
    score += (ratingScores[rating.recommendationTrend] || 0) * 20;
    
    // Upside score (cap at 50% to avoid outliers)
    if (rating.upside !== null) {
      score += Math.min(rating.upside, 50);
    }
    
    // Number of analysts bonus (more coverage = more reliable)
    score += Math.min(rating.numberOfAnalysts, 10) * 2;
    
    return { rating, score };
  });
  
  // Sort by score descending and return top N
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(item => item.rating);
}

export default { fetchTickerRating, fetchMultipleRatings, getTopPicks };
