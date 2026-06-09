# Keyword Rank Tracker

A high-performance SEO utility designed to automate search engine ranking monitoring across multiple scraping providers.

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.1-blue.svg" />
  <img src="https://img.shields.io/badge/Node.js-%3E%3D18.0.0-339933.svg" />
  <img src="https://img.shields.io/badge/TypeScript-6.x-3178C6.svg" />
  <a href="LICENSE">
    <img alt="License" src="https://img.shields.io/badge/license-MIT-yellow.svg" target="_blank" />
  </a>
</p>

## Description

Keyword Rank Tracker is a robust Node.js application built for developers and SEO professionals who require precise, automated tracking of website positions in Google Search Results. It eliminates the complexity of manual SERP monitoring by providing a unified API interface that supports multiple data extraction methods, including direct headless browser automation and specialized third-party scraping services. The platform is engineered for scalability and reliability, ensuring consistent data delivery while bypassing anti-bot measures.

## Features

- **Multi-Provider Scraper Architecture** - Switch seamlessly between Puppeteer, Scraping Robot, and Serper.dev to balance cost and performance.
- **Stealth Automation** - Integrated Puppeteer stealth plugins and user-agent rotation to maintain high success rates and avoid detection.
- **Deep SERP Analysis** - Support for multi-page search result scanning to find rankings even beyond the first page.
- **Strict Data Validation** - Enterprise-grade request validation using Zod to ensure data integrity and clear error reporting.
- **Production-Ready Logging** - Comprehensive event tracking and error monitoring powered by Winston for streamlined maintenance.
- **Developer-Centric Design** - Written entirely in TypeScript with a clean, modular architecture for easy extension and integration.

## Tech Stack

- **Backend Framework**: Node.js (Express 5.x)
- **Language**: TypeScript 6.x
- **Browser Automation**: Puppeteer, Puppeteer Extra (Stealth)
- **Data Extraction**: Cheerio
- **Validation**: Zod
- **Networking**: Axios
- **Logging**: Winston
- **Environment Management**: Dotenv

## Installation Guide

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- A browserless instance (optional, for remote Puppeteer execution)

### Steps

1. Clone the repository to your local machine:

```bash
git clone https://github.com/reynaldiarya/Keyword-Rank-Tracker.git
cd Keyword-Rank-Tracker
```

2. Install the project dependencies:

```bash
npm install
```

3. Configure the environment variables:

```bash
cp .env.example .env
```

4. Open the `.env` file and update the necessary configurations (see Configuration section).

5. Build the production bundle:

```bash
npm run build
```

6. Start the application:

```bash
npm start
```

For development with hot-reload:

```bash
npm run dev
```

## Configuration

The application uses environment variables for sensitive data and system settings.

### Environment Variables

| Variable | Description | Default / Example |
|----------|-------------|-------------------|
| `PORT` | The port the API server will listen on | `3003` |
| `NODE_ENV` | Application environment mode | `production` |
| `SCRAPING_ROBOT_API_KEY` | API Key for Scraping Robot provider | `your_api_key` |
| `SERPER_DEV_API_KEY` | API Key for Serper.dev provider | `your_api_key` |
| `BROWSER_WS_ENDPOINT` | WebSocket endpoint for remote Puppeteer | `ws://localhost:3000` |
| `PUPPETEER_USER_AGENT` | Custom User-Agent string for Puppeteer | `Mozilla/5.0...` |
| `PUPPETEER_COOKIE` | Custom cookies for search requests | `your_cookie` |

## Usage

### Track Keyword Rankings

The primary endpoint allows you to query the current ranking of a website for specific keywords.

**Endpoint:** `GET /keyword-ranking`

#### Request Body (JSON)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `website` | `string` | Yes | The domain or URL to track (e.g., `google.com`) |
| `keywords` | `array` | Yes | List of keywords to check rankings for |
| `page` | `number` | No | Number of Google pages to scan (default: `1`) |
| `scraper` | `enum` | No | Scraper type: `puppeteer`, `scrapingRobot`, or `serperDev` |

#### Sample Request

```json
{
  "website": "example.com",
  "keywords": ["modern web design", "seo tools"],
  "page": 1,
  "scraper": "puppeteer"
}
```

#### Sample Response

```json
{
  "website": "example.com",
  "page": 1,
  "totalFound": 2,
  "rankings": [
    {
      "keyword": "modern web design",
      "rank": 3,
      "url": "https://example.com/blog/modern-design"
    },
    {
      "keyword": "seo tools",
      "rank": 12,
      "url": "https://example.com/tools"
    }
  ]
}
```

## Project Structure

```text
src/
├── config/           # Application configuration and environment mapping
├── controllers/      # Request handlers and response logic
├── middleware/       # Custom Express middlewares (validation, errors)
├── routes/           # API route definitions
├── schemas/          # Zod validation schemas
├── services/         # Core business logic and scraper implementations
│   └── scrapers/     # Provider-specific scraping logic
├── types/            # TypeScript interface and type definitions
└── utils/            # Shared utilities and logger configuration
```

## Scripts / Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot-reload using tsx |
| `npm run build` | Compile TypeScript source code to JavaScript in `dist/` |
| `npm start` | Run the compiled production application |
| `npm run format` | Format source code using Prettier |
| `npm run lint` | Analyze code for potential errors and styling issues |
| `npm run lint:fix` | Automatically fix linting errors |

## Contributing

Contributions are essential for the evolution of this project. To contribute:

1. Fork the repository
2. Create a specific feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes with descriptive messages (`git commit -m 'Add amazing feature'`)
4. Push the branch to your fork (`git push origin feature/amazing-feature`)
5. Open a Pull Request for review

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for detailed terms and conditions.

## Author

Reynaldi Arya
