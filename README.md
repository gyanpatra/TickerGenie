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

- Morningstar (default) - https://www.youtube.com/@morningstar
- Mark Roussin CPA - https://www.youtube.com/@MarkRoussinCPA
- Nolan Gouveia - https://www.youtube.com/@NolanGouveia
- Custom URL (enter any YouTube channel URL)

## Tech Stack

### Frontend
- React Native (Expo)
- TypeScript
- React Native Web (for web support)
- Jest + React Testing Library (testing)

### Backend
- Node.js with Express (local development)
- AWS Lambda (production)
- AWS API Gateway
- AWS SES (for emails)
- AWS S3 + CloudFront (for static hosting)
- Jest + Supertest (testing)

## Project Structure

```
TickerGenie/
├── App.tsx                 # Main app entry point
├── src/
│   ├── __tests__/          # Frontend tests
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
├── backend/               # Node.js backend
│   ├── __tests__/         # Backend tests
│   ├── functions/         # Lambda handlers
│   │   ├── analyze.ts
│   │   ├── email.ts
│   │   └── latestVideo.ts
│   ├── lib/               # Shared utilities
│   │   ├── emailService.ts
│   │   ├── tickerExtractor.ts
│   │   ├── yahooFinance.ts
│   │   └── youtubeService.ts
│   ├── server.ts          # Express server for local dev
│   ├── template.yaml      # AWS SAM template
│   ├── package.json
│   └── tsconfig.json
├── .github/workflows/     # GitHub Actions CI
│   └── ci.yml
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
   npm install --legacy-peer-deps
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

3. Run tests:
   ```bash
   npm test
   ```

### Backend Setup (Local Development)

1. Navigate to backend directory:
   ```bash
   cd backend
   npm install
   ```

2. Start the local server:
   ```bash
   npm run start
   ```
   This starts an Express server on port 3001.

3. Run tests:
   ```bash
   npm test
   ```

4. Build TypeScript:
   ```bash
   npm run build
   ```

### Backend Setup (AWS Deployment)

1. Build the backend:
   ```bash
   cd backend
   npm run build
   ```

2. Deploy to AWS:
   ```bash
   aws cloudformation deploy \
     --template-file template.yaml \
     --stack-name tickergenie-backend \
     --capabilities CAPABILITY_IAM
   ```

3. Update the API URL in `src/services/api.ts` with your API Gateway endpoint.

## Environment Variables

### Frontend
- `EXPO_PUBLIC_API_URL`: Backend API URL (default: `https://api.tickergenie.com`)

### Backend (Local Development)
- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)

### Backend (AWS Lambda)
- `AWS_REGION`: AWS region
- `SES_FROM_EMAIL`: Verified SES email address for sending emails

## API Endpoints

### POST /api/analyze-channel
Analyzes the latest video from a YouTube channel for stock tickers.

**Request:**
```json
{
  "channelUrl": "https://www.youtube.com/@morningstar"
}
```

**Response:**
```json
{
  "channelUrl": "https://www.youtube.com/@morningstar",
  "channelName": "Morningstar",
  "latestVideoId": "abc123",
  "latestVideoTitle": "Top Stock Picks for 2024",
  "tickers": ["AAPL", "MSFT", "NVDA"],
  "topTickers": [
    { "ticker": "AAPL", "rating": "Buy", "source": "Yahoo Finance" },
    { "ticker": "MSFT", "rating": "Strong Buy", "source": "Yahoo Finance" }
  ]
}
```

### POST /api/email-results
Sends analysis results via email.

**Request:**
```json
{
  "email": "user@example.com",
  "analysis": {
    "channelUrl": "...",
    "channelName": "...",
    "latestVideoTitle": "...",
    "tickers": ["AAPL", "MSFT", ...],
    "topTickers": [
      { "ticker": "AAPL", "rating": "Buy", "source": "Yahoo Finance" }
    ]
  }
}
```

**Response:**
```json
{
  "message": "Email sent successfully",
  "messageId": "..."
}
```

### Legacy Endpoints (for backwards compatibility)

- `POST /analyze` - Analyze a video URL directly
- `POST /latest-video` - Get latest video from a channel
- `POST /email` - Send email with results

## Testing

### Frontend Tests
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### Backend Tests
```bash
cd backend
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## Building for Production

### Web Build
```bash
npx expo export --platform web
```
The web build will be in the `dist/` directory. Deploy to S3 + CloudFront.

### iOS/Android Build
Use Expo EAS Build:
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## AWS Configuration

### SES Setup
1. Verify your sender email address in AWS SES
2. If in sandbox mode, also verify recipient addresses
3. Request production access for unlimited sending

### S3 + CloudFront Setup
1. Create an S3 bucket for static hosting
2. Configure CloudFront distribution with S3 origin
3. Update bucket policy for public read access
4. Deploy web build to S3

## License

MIT

