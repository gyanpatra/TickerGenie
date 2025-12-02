/**
 * Ticker Extraction Utility
 * Extracts 2-5 letter stock tickers from text
 */

// Common stock ticker patterns - 2 to 5 uppercase letters
const TICKER_REGEX = /\b([A-Z]{2,5})\b/g;

// Words that look like tickers but aren't
const EXCLUDED_WORDS = new Set([
  // Common English words
  'THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HAD',
  'HER', 'WAS', 'ONE', 'OUR', 'OUT', 'HAS', 'HIS', 'HOW', 'ITS', 'LET',
  'MAY', 'NEW', 'NOW', 'OLD', 'SEE', 'WAY', 'WHO', 'BOY', 'DID', 'GET',
  'HIM', 'HOT', 'LOW', 'OWN', 'SAY', 'SHE', 'TOO', 'USE', 'TOP', 'HIGH',
  'JUST', 'LIKE', 'MAKE', 'OVER', 'SUCH', 'TAKE', 'INTO', 'YEAR', 'YOUR',
  'GOOD', 'SOME', 'THEM', 'TIME', 'VERY', 'WHEN', 'COME', 'MADE', 'FIND',
  'MORE', 'LONG', 'HERE', 'MANY', 'THAN', 'MOST', 'NEXT', 'ONLY', 'WHAT',
  'WILL', 'WITH', 'HAVE', 'THIS', 'THAT', 'FROM', 'THEY', 'BEEN', 'CALL',
  'EACH', 'LIVE', 'MUCH', 'NEED', 'PART', 'SURE', 'TELL', 'WELL', 'BACK',
  'BEST', 'BOTH', 'DOWN', 'EVEN', 'GIVE', 'LAST', 'LOOK', 'WANT', 'WORK',
  // Common 5-letter words
  'ABOUT', 'AFTER', 'AGAIN', 'BELOW', 'COULD', 'EVERY', 'FIRST', 'FOUND',
  'GREAT', 'HOUSE', 'LARGE', 'LEARN', 'NEVER', 'OTHER', 'PLACE', 'PLANT',
  'POINT', 'RIGHT', 'SMALL', 'SOUND', 'SPELL', 'STILL', 'STUDY', 'THEIR',
  'THERE', 'THESE', 'THING', 'THINK', 'THREE', 'WATER', 'WHERE', 'WHICH',
  'WHILE', 'WORLD', 'WOULD', 'WRITE', 'BEING', 'UNDER', 'STOCK', 'MONEY',
  'PRICE', 'SHARE', 'VALUE', 'TRADE', 'MAYBE', 'GOING', 'TODAY', 'VIDEO',
  // Financial terms that aren't tickers
  'ETF', 'IPO', 'CEO', 'CFO', 'COO', 'CTO', 'GDP', 'YTD', 'QOQ', 'MOM',
  'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'HKD', 'SGD',
  'ROI', 'YOY', 'EPS', 'PE', 'PB', 'PS', 'NAV', 'AUM', 'EBIT', 'EBITDA',
  'SEC', 'NYSE', 'AMEX', 'OTC', 'ADR', 'REIT',
  // YouTube / video terms
  'LIKE', 'GUYS', 'OKAY', 'LETS', 'LINK', 'BELOW', 'CHECK', 'HELLO', 'THANKS',
]);

// Known valid tickers (popular ones to include even if they match common words)
const KNOWN_TICKERS = new Set([
  // Major tech
  'AAPL', 'MSFT', 'GOOG', 'GOOGL', 'AMZN', 'META', 'NVDA', 'TSLA', 'AMD', 'INTC',
  // Finance
  'JPM', 'BAC', 'WFC', 'GS', 'MS', 'C', 'BRK', 'BRKB', 'V', 'MA',
  // Healthcare
  'JNJ', 'UNH', 'PFE', 'MRK', 'ABBV', 'TMO', 'ABT', 'LLY', 'BMY', 'AMGN',
  // Consumer
  'WMT', 'HD', 'MCD', 'NKE', 'SBUX', 'TGT', 'COST', 'LOW', 'TJX', 'DG',
  // Others
  'DIS', 'NFLX', 'CRM', 'PYPL', 'SQ', 'SHOP', 'UBER', 'LYFT', 'SNAP', 'TWTR',
  'PLTR', 'COIN', 'RIVN', 'LCID', 'NIO', 'XPEV', 'LI', 'BABA', 'JD', 'PDD',
]);

/**
 * Extract stock tickers from text
 * @param text The text to extract tickers from
 * @returns Array of unique tickers
 */
export function extractTickers(text: string): string[] {
  const matches = text.match(TICKER_REGEX) || [];
  
  // Filter and dedupe
  const tickers = new Set<string>();
  
  for (const match of matches) {
    // Check if it's a known ticker (include it)
    if (KNOWN_TICKERS.has(match)) {
      tickers.add(match);
      continue;
    }
    
    // Skip excluded words
    if (EXCLUDED_WORDS.has(match)) {
      continue;
    }
    
    // Basic validation - must be 2-5 chars
    if (match.length >= 2 && match.length <= 5) {
      tickers.add(match);
    }
  }
  
  return Array.from(tickers).sort();
}

/**
 * Validate if a string looks like a valid ticker symbol
 * @param ticker The ticker to validate
 * @returns boolean indicating if it's likely a valid ticker
 */
export function isValidTicker(ticker: string): boolean {
  // Must be 2-5 uppercase letters (matching the extraction pattern)
  if (!/^[A-Z]{2,5}$/.test(ticker)) {
    return false;
  }
  
  // Known tickers are always valid
  if (KNOWN_TICKERS.has(ticker)) {
    return true;
  }
  
  // Excluded words are not valid
  if (EXCLUDED_WORDS.has(ticker)) {
    return false;
  }
  
  return true;
}

export default { extractTickers, isValidTicker };
