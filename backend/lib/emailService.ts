/**
 * Email Service
 * Sends email results using AWS SES
 */

import * as AWS from 'aws-sdk';
import { AnalystRating } from './yahooFinance';

// Configure SES
const ses = new AWS.SES({
  region: process.env.AWS_REGION || 'us-east-1',
});

export interface EmailResult {
  videoTitle: string;
  channelName: string;
  videoUrl: string;
  analysisDate: string;
  extractedTickers: string[];
  topPicks: AnalystRating[];
  allRatings: AnalystRating[];
}

/**
 * Generate HTML email content
 */
function generateEmailHtml(result: EmailResult): string {
  const formatPrice = (price: number | null) => 
    price === null ? 'N/A' : `$${price.toFixed(2)}`;
  
  const formatUpside = (upside: number | null) => {
    if (upside === null) return 'N/A';
    const prefix = upside >= 0 ? '+' : '';
    return `${prefix}${upside.toFixed(1)}%`;
  };

  const getRatingColor = (rating: string) => {
    const lower = rating.toLowerCase();
    if (lower.includes('strong buy')) return '#00E676';
    if (lower.includes('buy')) return '#4CAF50';
    if (lower.includes('hold')) return '#FFD54F';
    if (lower.includes('sell')) return '#FF5252';
    return '#888888';
  };

  const tickerRow = (ticker: AnalystRating, rank?: number) => `
    <tr>
      ${rank ? `<td style="padding: 12px; border-bottom: 1px solid #333;">#${rank}</td>` : ''}
      <td style="padding: 12px; border-bottom: 1px solid #333; font-weight: bold; font-size: 16px;">${ticker.ticker}</td>
      <td style="padding: 12px; border-bottom: 1px solid #333;">${ticker.companyName}</td>
      <td style="padding: 12px; border-bottom: 1px solid #333;">
        <span style="background-color: ${getRatingColor(ticker.rating)}; color: #000; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
          ${ticker.rating}
        </span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #333;">${formatPrice(ticker.currentPrice)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #333;">${formatPrice(ticker.targetPrice)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #333; color: ${ticker.upside && ticker.upside >= 0 ? '#00E676' : '#FF5252'};">
        ${formatUpside(ticker.upside)}
      </td>
    </tr>
  `;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>TickerGenie Analysis Results</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #000; color: #fff; margin: 0; padding: 20px;">
      <div style="max-width: 800px; margin: 0 auto; background-color: #121212; border-radius: 12px; padding: 24px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #00D4AA; margin: 0; font-size: 28px;">🧞 TickerGenie</h1>
          <p style="color: #B0B0B0; margin-top: 8px;">Stock Analysis Results</p>
        </div>
        
        <!-- Video Info -->
        <div style="background-color: #1E1E1E; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <h2 style="margin: 0 0 8px 0; font-size: 18px;">${result.videoTitle}</h2>
          <p style="color: #00D4AA; margin: 0 0 4px 0;">${result.channelName}</p>
          <p style="color: #666; margin: 0; font-size: 14px;">Analyzed on ${new Date(result.analysisDate).toLocaleDateString()}</p>
          <a href="${result.videoUrl}" style="color: #40C4FF; text-decoration: none; font-size: 14px;">View Video →</a>
        </div>
        
        <!-- Extracted Tickers -->
        <div style="margin-bottom: 24px;">
          <h3 style="color: #fff; margin-bottom: 12px;">Extracted Tickers (${result.extractedTickers.length})</h3>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${result.extractedTickers.map(ticker => `
              <span style="background-color: #1E1E1E; border: 1px solid #333; border-radius: 4px; padding: 6px 10px; font-size: 14px; font-weight: 600;">
                ${ticker}
              </span>
            `).join('')}
          </div>
        </div>
        
        <!-- Top 5 Picks -->
        ${result.topPicks.length > 0 ? `
          <div style="margin-bottom: 24px;">
            <h3 style="color: #fff; margin-bottom: 12px;">🏆 Top 5 Picks</h3>
            <p style="color: #B0B0B0; font-size: 14px; margin-bottom: 16px;">Based on analyst ratings and upside potential</p>
            <table style="width: 100%; border-collapse: collapse; background-color: #1A1A1A; border-radius: 8px; overflow: hidden;">
              <thead>
                <tr style="background-color: #2A2A2A;">
                  <th style="padding: 12px; text-align: left; color: #B0B0B0; font-weight: 600;">Rank</th>
                  <th style="padding: 12px; text-align: left; color: #B0B0B0; font-weight: 600;">Ticker</th>
                  <th style="padding: 12px; text-align: left; color: #B0B0B0; font-weight: 600;">Company</th>
                  <th style="padding: 12px; text-align: left; color: #B0B0B0; font-weight: 600;">Rating</th>
                  <th style="padding: 12px; text-align: left; color: #B0B0B0; font-weight: 600;">Current</th>
                  <th style="padding: 12px; text-align: left; color: #B0B0B0; font-weight: 600;">Target</th>
                  <th style="padding: 12px; text-align: left; color: #B0B0B0; font-weight: 600;">Upside</th>
                </tr>
              </thead>
              <tbody>
                ${result.topPicks.map((ticker, index) => tickerRow(ticker, index + 1)).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}
        
        <!-- All Ratings -->
        <div style="margin-bottom: 24px;">
          <h3 style="color: #fff; margin-bottom: 12px;">All Analyst Ratings</h3>
          <table style="width: 100%; border-collapse: collapse; background-color: #1A1A1A; border-radius: 8px; overflow: hidden;">
            <thead>
              <tr style="background-color: #2A2A2A;">
                <th style="padding: 12px; text-align: left; color: #B0B0B0; font-weight: 600;">Ticker</th>
                <th style="padding: 12px; text-align: left; color: #B0B0B0; font-weight: 600;">Company</th>
                <th style="padding: 12px; text-align: left; color: #B0B0B0; font-weight: 600;">Rating</th>
                <th style="padding: 12px; text-align: left; color: #B0B0B0; font-weight: 600;">Current</th>
                <th style="padding: 12px; text-align: left; color: #B0B0B0; font-weight: 600;">Target</th>
                <th style="padding: 12px; text-align: left; color: #B0B0B0; font-weight: 600;">Upside</th>
              </tr>
            </thead>
            <tbody>
              ${result.allRatings.map(ticker => tickerRow(ticker)).join('')}
            </tbody>
          </table>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; padding-top: 24px; border-top: 1px solid #333;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            Generated by TickerGenie • Data from Yahoo Finance
          </p>
          <p style="color: #666; font-size: 12px; margin: 8px 0 0 0;">
            This is not financial advice. Always do your own research before investing.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate plain text email content
 */
function generateEmailText(result: EmailResult): string {
  const formatPrice = (price: number | null) => 
    price === null ? 'N/A' : `$${price.toFixed(2)}`;
  
  const formatUpside = (upside: number | null) => {
    if (upside === null) return 'N/A';
    const prefix = upside >= 0 ? '+' : '';
    return `${prefix}${upside.toFixed(1)}%`;
  };

  let text = `
🧞 TickerGenie - Stock Analysis Results
========================================

VIDEO: ${result.videoTitle}
CHANNEL: ${result.channelName}
ANALYZED: ${new Date(result.analysisDate).toLocaleDateString()}
URL: ${result.videoUrl}

EXTRACTED TICKERS (${result.extractedTickers.length}):
${result.extractedTickers.join(', ')}

`;

  if (result.topPicks.length > 0) {
    text += `
🏆 TOP 5 PICKS
----------------------------------------
`;
    result.topPicks.forEach((ticker, index) => {
      text += `
#${index + 1} ${ticker.ticker} - ${ticker.companyName}
   Rating: ${ticker.rating}
   Current: ${formatPrice(ticker.currentPrice)} | Target: ${formatPrice(ticker.targetPrice)}
   Upside: ${formatUpside(ticker.upside)}
`;
    });
  }

  text += `
ALL ANALYST RATINGS
----------------------------------------
`;
  result.allRatings.forEach(ticker => {
    text += `${ticker.ticker}: ${ticker.rating} | ${formatPrice(ticker.currentPrice)} → ${formatPrice(ticker.targetPrice)} (${formatUpside(ticker.upside)})
`;
  });

  text += `
----------------------------------------
Generated by TickerGenie • Data from Yahoo Finance
This is not financial advice. Always do your own research before investing.
`;

  return text;
}

/**
 * Send email with analysis results
 */
export async function sendResultsEmail(
  toEmail: string,
  result: EmailResult
): Promise<{ messageId: string }> {
  const fromEmail = process.env.SES_FROM_EMAIL || 'noreply@tickergenie.com';
  
  const params: AWS.SES.SendEmailRequest = {
    Source: fromEmail,
    Destination: {
      ToAddresses: [toEmail],
    },
    Message: {
      Subject: {
        Data: `🧞 TickerGenie: Analysis of "${result.videoTitle}"`,
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: generateEmailHtml(result),
          Charset: 'UTF-8',
        },
        Text: {
          Data: generateEmailText(result),
          Charset: 'UTF-8',
        },
      },
    },
  };

  const response = await ses.sendEmail(params).promise();
  
  return { messageId: response.MessageId };
}

export default { sendResultsEmail };
