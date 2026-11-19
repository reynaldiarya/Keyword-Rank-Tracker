# Keyword Rank Tracker

A high-performance SEO utility designed to automate search engine ranking monitoring across multiple scraping providers.

<p align="center">
  <img src="https://img.shields.io/badge/version-1.1.0-blue.svg" />
  <img src="https://img.shields.io/badge/Node.js-%3E%3D22.0.0-339933.svg" />
  <img src="https://img.shields.io/badge/TypeScript-6.x-3178C6.svg" />
  <a href="LICENSE">
    <img alt="License" src="https://img.shields.io/badge/license-MIT-yellow.svg" target="_blank" />
  </a>
</p>

## Description

Keyword Rank Tracker is a robust Node.js application built for developers and SEO professionals who require precise, automated tracking of website positions in Google Search Results. It eliminates the complexity of manual SERP monitoring by providing a unified API interface that supports multiple data extraction methods, including direct headless browser automation and specialized third-party scraping services. The platform is engineered for scalability and reliability, ensuring consistent data delivery while bypassing anti-bot measures.

## Features

- **Multi-Provider Scraper Architecture** - Switch between Puppeteer, Scraping Robot, and Serper.dev for each scan.
- **Stealth Automation** - Use Puppeteer Extra with the Stealth plugin and a local or remote Chrome instance.
- **Deep SERP Analysis** - Scan multiple Google result pages and see the rank and URL or an unranked status for each keyword.
- **Strict Data Validation** - Validate ranking requests with Zod and display field errors in the web interface.
- **Production-Ready Logging** - Log scraper activity and provider errors to the console with Winston.
- **Developer-Centric Design** - The TypeScript application includes a Hono JSX interface and a JSON API.

## Tech Stack

- **Backend Framework**: Node.js (Hono and `@hono/node-server`)
- **Frontend**: Hono JSX and Tailwind CSS
- **Language**: TypeScript 6.x
- **Browser Automation**: Puppeteer, Puppeteer Extra (Stealth)
- **Data Extraction**: Cheerio
- **Validation**: Zod and `@hono/zod-validator`
- **Networking**: Axios
- **Logging**: Winston console transport
- **Environment Management**: Node.js `--env-file-if-exists`
- **Asset Build**: Tailwind CLI and esbuild

## Installation Guide

### Prerequisites

- Node.js 22 or higher
- npm (included with Node.js)
- Local or remote Chrome for Puppeteer, or an API key for Scraping Robot or Serper.dev

### Steps

1. Clone the repository and enter its directory.

   ```bash
   git clone https://github.com/reynaldiarya/Keyword-Rank-Tracker.git
   cd Keyword-Rank-Tracker
   ```

2. Install the project dependencies from the lockfile.

   ```bash
   npm ci
   ```

3. Copy the environment template to `.env` using your shell.

   ```bash
   cp .env.example .env
   ```

   ```powershell
   Copy-Item .env.example .env
   ```

4. Set the environment variables for your scraper. See [Configuration](#configuration).

5. Build the server and frontend assets.

   ```bash
   npm run build
   ```

6. Start the compiled Node server.

   ```bash
   npm start
   ```

For development, start the server and frontend watchers.

```bash
npm run dev
```

On a Node-compatible host with its own HTTP adapter, import `dist/app.js` and serve `dist/assets/` under `/assets/`. The app imports Puppeteer and Winston modules that use Node.js APIs.

## Configuration

The application loads `.env` when it exists. Set provider credentials on the server.

### Environment Variables

| Variable                 | Description                                                                       | Default / Example                      |
| ------------------------ | --------------------------------------------------------------------------------- | -------------------------------------- |
| `PORT`                   | HTTP port used by the Node server.                                                | `3000`                                 |
| `NODE_ENV`               | Set to `development` to enable debug logging.                                     | Unset (`production` in `.env.example`) |
| `SCRAPING_ROBOT_API_KEY` | API key for the Scraping Robot provider.                                          | Unset                                  |
| `SERPER_DEV_API_KEY`     | API key for the Serper.dev provider.                                              | Unset                                  |
| `BROWSER_WS_ENDPOINT`    | WebSocket URL for a remote Chrome instance. Leave empty to launch Chrome locally. | Unset                                  |
| `PUPPETEER_USER_AGENT`   | Optional override for Puppeteer's User-Agent header.                              | Built-in value                         |
| `PUPPETEER_COOKIE`       | Optional Cookie header for Puppeteer. Leave empty for public searches.            | Unset                                  |

To use local Chrome with the built-in User-Agent, clear the sample values for `BROWSER_WS_ENDPOINT`, `PUPPETEER_USER_AGENT`, and `PUPPETEER_COOKIE` after copying `.env.example`. Puppeteer downloads its Chrome binary during dependency installation.

## Usage

### Track Keyword Rankings

Enter a website and one keyword per line, set **Pages to scan**, choose a **Scraper**, and select **Check rankings**. The tracker shows progress and marks keywords with no match in the pages scanned. [Open the local tracker](http://localhost:3000)

**Endpoint:** `POST /keyword-ranking`

Send JSON with `Content-Type: application/json`. The Node server also supports `GET /keyword-ranking` with the same JSON body for existing clients.

#### Request Body (JSON)

| Field      | Type       | Required | Description                                                                              |
| ---------- | ---------- | -------- | ---------------------------------------------------------------------------------------- |
| `website`  | `string`   | Yes      | The domain or URL to track, such as `facebook.com`.                                      |
| `keywords` | `string[]` | Yes      | At least one keyword to check.                                                           |
| `page`     | `number`   | No       | The Google results page for this request. Use an integer of at least 1. Defaults to `1`. |
| `scraper`  | `enum`     | No       | `puppeteer`, `scrapingRobot`, or `serperDev`. Defaults to `scrapingRobot`.               |

#### Sample Request

```json
{
  "website": "facebook.com",
  "keywords": ["facebook", "typescript documentation"],
  "page": 1,
  "scraper": "serperDev"
}
```

#### Sample Response

```json
{
  "website": "facebook.com",
  "page": 1,
  "totalFound": 1,
  "rankings": [
    {
      "keyword": "facebook",
      "rank": 1,
      "url": "https://www.facebook.com/"
    }
  ]
}
```

The API returns matching keywords from the requested page. If one or more keyword lookups fail, check for `X-Ranking-Incomplete: true` alongside any matches returned. Schema validation errors return HTTP `400`.

## Project Structure

```text
src/
├── app.ts            # Shared Hono application and error handling
├── index.ts          # Node server and static asset serving
├── config/           # Application configuration and environment mapping
├── controllers/      # Request handlers and response logic
├── middleware/       # JSON request body preparation
├── routes/           # API route definitions
├── schemas/          # Zod validation schemas
├── services/         # Core business logic and scraper implementations
│   └── scrapers/     # Provider-specific scraping logic
├── types/            # TypeScript interface and type definitions
├── utils/            # Shared utilities and logger configuration
└── web/              # Hono JSX page, browser script, and Tailwind styles
```

## Scripts / Commands

| Command                | Description                                                        |
| ---------------------- | ------------------------------------------------------------------ |
| `npm run dev`          | Build the frontend assets and start the server and asset watchers. |
| `npm run build`        | Compile TypeScript and build the frontend assets in `dist/`.       |
| `npm start`            | Run the compiled Node application.                                 |
| `npm run format`       | Format the source, configuration, and README with Prettier.        |
| `npm run lint`         | Analyze the source with ESLint.                                    |
| `npm run lint:fix`     | Apply available ESLint fixes.                                      |
| `npm run dev:server`   | Watch the Node entry point with tsx.                               |
| `npm run dev:css`      | Watch and rebuild the Tailwind stylesheet.                         |
| `npm run dev:client`   | Watch and rebuild the browser bundle.                              |
| `npm run build:assets` | Build the stylesheet and browser bundle.                           |
| `npm run build:css`    | Compile Tailwind CSS to `dist/assets/tracker.css`.                 |
| `npm run build:client` | Bundle browser code to `dist/assets/tracker.js`.                   |

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
