# Keyword Rank Tracker

A TypeScript-based Node.js application designed to track keyword search engine rankings on Google (Indonesia region).

## Features

- **Keyword Rank Tracking**: Checks the ranking of specific keywords on Google Search (ID).
- **Multiple Scrapers**:
  - **Puppeteer**: Uses a headless browser (local or remote) to scrape Google. Optimized to use a single browser instance for performance.
  - **Scraping Robot**: Uses the Scraping Robot API (requires API Key) for more reliable/proxy-rotational scraping.
  - **Serper.dev**: Uses the Serper.dev API (requires API Key) for fast and reliable Google Search results.
- **Automated Scraping**: Handles multiple keywords in batches.
- **Pagination Support**: Capable of checking rankings across multiple result pages.

## Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**
- **Scraping Robot API Key** (Optional): Only required if you choose to use the `scrapingRobot` scraper.
- **Serper.dev API Key** (Optional): Only required if you choose to use the `serperDev` scraper.

## Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd Keyword-Rank-Tracker
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the `.env.example` file to create a new `.env` file:

   ```bash
   cp .env.example .env
   ```

   Open the `.env` file and configure your settings:

   ```env
   PORT=3003
   NODE_ENV=development

   # Optional: Only needed if using 'scrapingRobot' mode
   SCRAPING_ROBOT_API_KEY=your_actual_api_key_here

   # Optional: Only needed if using 'serperDev' mode
   SERPER_DEV_API_KEY=your_serper_api_key_here

   # Optional: Puppeteer Configuration
   # Leave empty to launch a local headless Chrome.
   # Or set a websocket endpoint (e.g. browserless.io) to use remote browser.
   BROWSER_WS_ENDPOINT=

   # Optional: Puppeteer Customization
   PUPPETEER_USER_AGENT=Mozilla/5.0...
   PUPPETEER_COOKIE=
   ```

## Usage

### Development Mode

To run the application in development mode with hot-reloading:

```bash
npm run dev
```

### Production Build

To build and start the application for production:

```bash
npm run build
npm start
```

### Linting & Formatting

- **Lint code:** `npm run lint`
- **Fix lint issues:** `npm run lint:fix`
- **Format code:** `npm run format`

## API Endpoints

### Check Keyword Rankings

- **Endpoint**: `/keyword-ranking`
- **Method**: `GET`
- **Headers**: `Content-Type: application/json`
- **Body**:
  ```json
  {
    "website": "example.com",
    "keywords": ["keyword1", "keyword2"],
    "page": 1,
    "scraper": "serperDev" // Options: "scrapingRobot", "puppeteer", "serperDev" (default: scrapingRobot)
  }
  ```
  > **Note**: This endpoint uses a GET request with a JSON body. Ensure your client (e.g., Postman, Insomnia) supports this.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Scraping**: Puppeteer (Headless Chrome), Cheerio, Axios
- **Utilities**: Winston (Logging), Zod (Validation)

## License

ISC
