# 🧞 TickerGenie

TickerGenie is a cross-platform app (iOS, Android, Web) that analyzes YouTube stock analyst videos. It extracts tickers from transcripts, finds top picks, fetches analyst ratings from Yahoo Finance, and emails results. Built with React Native (Expo) + AWS, featuring a sleek black UI.

## Features

- 📱 **Cross-Platform**: Works on iOS, Android, and Web
- 🎨 **Black Theme**: Sleek, modern dark UI
- 🎬 **YouTube Integration**: Analyze videos from popular stock analysts
- 📊 **Ticker Extraction**: Automatically extracts 2-5 letter stock tickers from video transcripts
- 📈 **Yahoo Finance Ratings**: Fetches real-time analyst ratings and price targets
- 🏆 **Top 5 Picks**: Automatically ranks and displays the best stock picks
- 📧 **Email Results**: Send analysis results directly to your inbox
- ☁️ **AWS Deployment**: Serverless backend with Lambda, API Gateway, and SES

## Default Analysts

- Morningstar (default)
- Seeking Alpha
- The Motley Fool
- CNBC
- Custom URL (enter any YouTube video URL)

## Tech Stack

### Frontend
- React Native (Expo)
- TypeScript
- React Native Web (for web support)

### Backend
- AWS Lambda (Node.js)
- AWS API Gateway
- AWS SES (for emails)
- AWS S3 + CloudFront (for static hosting)

## Project Structure

```
TickerGenie/
├── App.tsx                 # Main app entry point
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ActionButton.tsx
│   │   ├── AnalystDropdown.tsx
│   │   ├── CustomUrlInput.tsx
│   │   ├── EmailModal.tsx
│   │   ├── ResultsDisplay.tsx
│   │   └── TickerCard.tsx
│   ├── screens/           # App screens
│   │   └── HomeScreen.tsx
│   ├── services/          # API services
│   │   └── api.ts
│   ├── theme/             # Theme configuration
│   │   └── colors.ts
│   └── types/             # TypeScript types
│       └── index.ts
├── backend/               # AWS Lambda backend
│   ├── functions/         # Lambda handlers
│   │   ├── analyze.ts
│   │   ├── email.ts
│   │   └── latestVideo.ts
│   ├── lib/               # Shared utilities
│   │   ├── emailService.ts
│   │   ├── tickerExtractor.ts
│   │   ├── yahooFinance.ts
│   │   └── youtubeService.ts
│   ├── template.yaml      # AWS SAM template
│   ├── package.json
│   └── tsconfig.json
└── assets/                # App icons and images
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- AWS CLI (for backend deployment)

### Frontend Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   # For web
   npm run web

   # For iOS
   npm run ios

   # For Android
   npm run android
   ```

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   npm install
   ```

2. Build TypeScript:
   ```bash
   npm run build
   ```

3. Deploy to AWS:
   ```bash
   aws cloudformation deploy \
     --template-file template.yaml \
     --stack-name tickergenie-backend \
     --capabilities CAPABILITY_IAM
   ```

4. Update the API URL in `src/services/api.ts` with your API Gateway endpoint.

## Environment Variables

### Frontend
- `EXPO_PUBLIC_API_URL`: Backend API URL

### Backend (AWS Lambda)
- `AWS_REGION`: AWS region
- `SES_FROM_EMAIL`: Verified SES email address for sending emails

## AWS Setup

1. **SES Configuration**: Verify your sender email address in AWS SES
2. **API Gateway**: Created automatically via SAM template
3. **S3 + CloudFront**: For static web hosting

## API Endpoints

### POST /analyze
Analyzes a YouTube video transcript for stock tickers.

**Request:**
```json
{
  "videoUrl": "https://www.youtube.com/watch?v=..."
}
```

**Response:**
```json
{
  "id": "analysis_...",
  "videoUrl": "...",
  "videoTitle": "...",
  "channelName": "...",
  "extractedTickers": ["AAPL", "MSFT", "NVDA"],
  "tickerRatings": [...],
  "topPicks": [...],
  "analysisDate": "..."
}
```

### POST /latest-video
Gets the latest video URL from a YouTube channel.

**Request:**
```json
{
  "channelUrl": "https://www.youtube.com/@MorningstarInc"
}
```

### POST /email
Sends analysis results via email.

**Request:**
```json
{
  "email": "user@example.com",
  "results": { ... }
}
```

## License

MIT

