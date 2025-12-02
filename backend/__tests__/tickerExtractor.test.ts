/**
 * Tests for Ticker Extraction Utility
 * Following TDD approach - tests written to verify ticker extraction logic
 */

import { extractTickers, isValidTicker } from '../lib/tickerExtractor';

describe('extractTickers', () => {
  describe('basic ticker extraction', () => {
    it('should extract simple tickers from text', () => {
      const text = 'I recommend buying AAPL and MSFT stocks today.';
      const tickers = extractTickers(text);
      expect(tickers).toContain('AAPL');
      expect(tickers).toContain('MSFT');
    });

    it('should extract multiple known tickers', () => {
      const text = 'Looking at TSLA NVDA GOOG AMZN for the portfolio.';
      const tickers = extractTickers(text);
      expect(tickers).toContain('TSLA');
      expect(tickers).toContain('NVDA');
      expect(tickers).toContain('GOOG');
      expect(tickers).toContain('AMZN');
    });

    it('should extract tickers with 2 to 5 uppercase letters', () => {
      const text = 'Check out GS MS V and BRKB for value investing.';
      const tickers = extractTickers(text);
      expect(tickers).toContain('GS');
      expect(tickers).toContain('MS');
      expect(tickers).toContain('V');
      expect(tickers).toContain('BRKB');
    });
  });

  describe('stopword filtering', () => {
    it('should exclude common English words', () => {
      const text = 'THE stock AND market FOR investors ARE looking.';
      const tickers = extractTickers(text);
      expect(tickers).not.toContain('THE');
      expect(tickers).not.toContain('AND');
      expect(tickers).not.toContain('FOR');
      expect(tickers).not.toContain('ARE');
    });

    it('should exclude financial terms that are not tickers', () => {
      const text = 'The CEO discussed EPS GDP and ETF performance with the FED watching.';
      const tickers = extractTickers(text);
      expect(tickers).not.toContain('CEO');
      expect(tickers).not.toContain('EPS');
      expect(tickers).not.toContain('GDP');
      expect(tickers).not.toContain('ETF');
      expect(tickers).not.toContain('FED');
    });

    it('should exclude currency codes', () => {
      const text = 'Trading USD EUR GBP JPY pairs.';
      const tickers = extractTickers(text);
      expect(tickers).not.toContain('USD');
      expect(tickers).not.toContain('EUR');
      expect(tickers).not.toContain('GBP');
      expect(tickers).not.toContain('JPY');
    });

    it('should return empty array for text containing only stopwords', () => {
      const text = 'THE AND FOR ARE BUT NOT YOU ALL CAN HAD';
      const tickers = extractTickers(text);
      expect(tickers).toHaveLength(0);
    });
  });

  describe('case sensitivity', () => {
    it('should only extract ALL-CAPS sequences as tickers', () => {
      const text = 'Apple (AAPL) and microsoft (MSFT) are tech stocks. Tsla is also mentioned.';
      const tickers = extractTickers(text);
      expect(tickers).toContain('AAPL');
      expect(tickers).toContain('MSFT');
      expect(tickers).not.toContain('Apple');
      expect(tickers).not.toContain('Tsla');
    });

    it('should ignore mixed case words', () => {
      const text = 'Tesla TSLA Microsoft MSFT Amazon Amzn';
      const tickers = extractTickers(text);
      expect(tickers).toContain('TSLA');
      expect(tickers).toContain('MSFT');
      expect(tickers).not.toContain('Tesla');
      expect(tickers).not.toContain('Amzn');
    });
  });

  describe('deduplication', () => {
    it('should deduplicate tickers', () => {
      const text = 'I love AAPL and AAPL is great. AAPL will grow.';
      const tickers = extractTickers(text);
      const aaplCount = tickers.filter(t => t === 'AAPL').length;
      expect(aaplCount).toBe(1);
    });

    it('should deduplicate multiple duplicate tickers', () => {
      const text = 'TSLA AAPL TSLA NVDA AAPL TSLA NVDA MSFT';
      const tickers = extractTickers(text);
      expect(tickers.filter(t => t === 'TSLA').length).toBe(1);
      expect(tickers.filter(t => t === 'AAPL').length).toBe(1);
      expect(tickers.filter(t => t === 'NVDA').length).toBe(1);
      expect(tickers.filter(t => t === 'MSFT').length).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle tickers followed by punctuation', () => {
      const text = 'Check AAPL, MSFT. NVDA! TSLA?';
      const tickers = extractTickers(text);
      expect(tickers).toContain('AAPL');
      expect(tickers).toContain('MSFT');
      expect(tickers).toContain('NVDA');
      expect(tickers).toContain('TSLA');
    });

    it('should handle tickers in parentheses', () => {
      const text = 'Apple (AAPL) and Microsoft (MSFT) stocks.';
      const tickers = extractTickers(text);
      expect(tickers).toContain('AAPL');
      expect(tickers).toContain('MSFT');
    });

    it('should handle tickers with colons', () => {
      const text = 'Top picks: AAPL, MSFT, NVDA';
      const tickers = extractTickers(text);
      expect(tickers).toContain('AAPL');
      expect(tickers).toContain('MSFT');
      expect(tickers).toContain('NVDA');
    });

    it('should handle empty string', () => {
      const tickers = extractTickers('');
      expect(tickers).toHaveLength(0);
    });

    it('should handle string with no potential tickers', () => {
      const text = 'this is a lowercase sentence with no tickers';
      const tickers = extractTickers(text);
      expect(tickers).toHaveLength(0);
    });

    it('should handle string with only numbers', () => {
      const text = '12345 67890 123';
      const tickers = extractTickers(text);
      expect(tickers).toHaveLength(0);
    });

    it('should reject tickers longer than 5 characters', () => {
      const text = 'TOOLONG and VERYLONGTICKER should not match.';
      const tickers = extractTickers(text);
      expect(tickers).not.toContain('TOOLONG');
      expect(tickers).not.toContain('VERYLONGTICKER');
    });

    it('should reject single letter tickers that are not in known list', () => {
      const text = 'A B C D E single letters.';
      const tickers = extractTickers(text);
      // Single letter matches are filtered out unless they're known tickers
      expect(tickers).not.toContain('A'); // Excluded word
      expect(tickers).not.toContain('B'); // Not a known ticker
      // But known single-letter tickers like C (Citigroup) would be included
    });
  });

  describe('known tickers override', () => {
    it('should include known tickers even if they might look like stopwords', () => {
      const text = 'Looking at META and COST today.';
      const tickers = extractTickers(text);
      expect(tickers).toContain('META');
      expect(tickers).toContain('COST');
    });

    it('should include major tech company tickers', () => {
      const text = 'AAPL MSFT GOOG GOOGL AMZN META NVDA TSLA AMD INTC';
      const tickers = extractTickers(text);
      expect(tickers).toContain('AAPL');
      expect(tickers).toContain('MSFT');
      expect(tickers).toContain('GOOG');
      expect(tickers).toContain('GOOGL');
      expect(tickers).toContain('AMZN');
      expect(tickers).toContain('META');
      expect(tickers).toContain('NVDA');
      expect(tickers).toContain('TSLA');
      expect(tickers).toContain('AMD');
      expect(tickers).toContain('INTC');
    });
  });

  describe('realistic transcript samples', () => {
    it('should extract tickers from a mock video transcript', () => {
      const transcript = `
        Hey everyone, welcome back to the channel. Today we're going to look at 
        some great stock picks for 2024. First up is AAPL, Apple is showing strong 
        growth. Next we have NVDA, Nvidia is dominating the AI chip market. 
        I'm also bullish on MSFT because of their cloud business. Don't forget 
        about GOOGL and their advertising revenue. Finally, META looks like a 
        great value play right now. These are my TOP picks for the year.
      `;
      const tickers = extractTickers(transcript);
      expect(tickers).toContain('AAPL');
      expect(tickers).toContain('NVDA');
      expect(tickers).toContain('MSFT');
      expect(tickers).toContain('GOOGL');
      expect(tickers).toContain('META');
      expect(tickers).not.toContain('TOP'); // Should be filtered as stopword
    });
  });
});

describe('isValidTicker', () => {
  it('should return true for known tickers', () => {
    expect(isValidTicker('AAPL')).toBe(true);
    expect(isValidTicker('MSFT')).toBe(true);
    expect(isValidTicker('TSLA')).toBe(true);
  });

  it('should return true for valid unknown tickers', () => {
    expect(isValidTicker('XYZ')).toBe(true);
    expect(isValidTicker('ABCD')).toBe(true);
  });

  it('should return false for stopwords', () => {
    expect(isValidTicker('THE')).toBe(false);
    expect(isValidTicker('AND')).toBe(false);
    expect(isValidTicker('CEO')).toBe(false);
  });

  it('should return false for non-uppercase strings', () => {
    expect(isValidTicker('aapl')).toBe(false);
    expect(isValidTicker('Aapl')).toBe(false);
  });

  it('should return false for unknown single-letter strings', () => {
    // Unknown single letters are too short/ambiguous
    expect(isValidTicker('B')).toBe(false);
    expect(isValidTicker('X')).toBe(false);
  });

  it('should return true for known single-letter tickers', () => {
    // Known single-letter tickers like V (Visa), C (Citigroup) are valid
    expect(isValidTicker('V')).toBe(true);
    expect(isValidTicker('C')).toBe(true);
  });

  it('should return false for strings too long', () => {
    expect(isValidTicker('TOOLONG')).toBe(false);
  });

  it('should return false for strings with numbers', () => {
    expect(isValidTicker('AA1')).toBe(false);
    expect(isValidTicker('123')).toBe(false);
  });
});
