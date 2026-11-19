import type { FC } from 'hono/jsx';

const ScanForm: FC = () => (
  <section class="scan-panel min-w-0 p-5 sm:p-7" aria-labelledby="scan-title">
    <h2 id="scan-title" class="panel-title mb-5" tabIndex={-1}>
      Scan setup
    </h2>
    <form id="rank-form" class="grid gap-4">
      <label class="field" for="website">
        <span>Website</span>
        <input
          class="control"
          id="website"
          name="website"
          placeholder="example.com"
          inputMode="url"
          autoCapitalize="none"
          spellcheck={false}
          required
        />
      </label>

      <div class="field">
        <span>
          <label for="keywords">Keywords</label>
          <span class="field-note" id="keyword-help">
            One per line
          </span>
        </span>
        <textarea
          class="control min-h-24 resize-y"
          id="keywords"
          name="keywords"
          placeholder={'running shoes\ntrail running shoes'}
          aria-describedby="keyword-help"
          rows={3}
          required
        />
      </div>

      <div class="grid grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] gap-3 sm:gap-4">
        <label class="field" for="pages">
          <span>Pages to scan</span>
          <input
            class="control"
            id="pages"
            name="pages"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            value={1}
            required
          />
        </label>
        <label class="field" for="scraper">
          <span>Scraper</span>
          <span class="select-wrap">
            <select class="control" id="scraper" name="scraper">
              <option value="puppeteer">Puppeteer</option>
              <option value="scrapingRobot">Scraping Robot</option>
              <option value="serperDev">Serper.dev</option>
            </select>
          </span>
        </label>
      </div>

      <div class="mt-1 grid gap-2">
        <button type="submit" id="scan-button" class="scan-button" disabled>
          <span id="scan-button-label">Check rankings</span>
          <span class="arrow arrow-right" aria-hidden="true"></span>
        </button>
        <p id="scan-feedback" class="scan-feedback empty:hidden" role="status"></p>
        <p id="scan-error" class="scan-error empty:hidden" role="alert"></p>
        <noscript>
          <p class="scan-error">Enable JavaScript to check rankings.</p>
        </noscript>
      </div>
    </form>
  </section>
);

const Rankings: FC = () => (
  <section
    class="rankings-panel flex min-h-[15rem] min-w-0 flex-col sm:min-h-[21rem]"
    aria-labelledby="rankings-title"
  >
    <div class="rankings-heading px-5 pt-5 pb-4 sm:px-7 sm:pt-7">
      <h2 id="rankings-title" class="panel-title" tabIndex={-1}>
        Rankings
      </h2>
      <p id="rankings-summary" class="rankings-summary empty:hidden" role="status"></p>
    </div>
    <table id="rankings-table" class="rankings-table" aria-labelledby="rankings-title" role="table">
      <colgroup>
        <col class="keyword-column" />
        <col class="rank-column" />
        <col />
      </colgroup>
      <thead role="rowgroup">
        <tr role="row">
          <th id="keyword-column-title" role="columnheader" scope="col">
            Keyword
          </th>
          <th id="rank-column-title" role="columnheader" scope="col">
            Rank
          </th>
          <th id="url-column-title" role="columnheader" scope="col">
            Ranking URL
          </th>
        </tr>
      </thead>
      <tbody id="ranking-rows" role="rowgroup"></tbody>
    </table>
    <div
      id="ranking-placeholder"
      class="ranking-placeholder flex flex-1 items-center px-5 py-9 sm:px-7"
    >
      <div class="max-w-sm">
        <h3 id="ranking-state-title">No scan yet</h3>
        <p id="ranking-state-message">
          Your keywords will appear here in the order you entered them.
        </p>
        <progress
          id="scan-progress"
          class="scan-progress"
          aria-label="Google pages checked"
          hidden
        ></progress>
      </div>
    </div>
  </section>
);

export const renderTracker = () => (
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta
        name="description"
        content="Check where a website ranks in Google’s organic search results."
      />
      <title>Keyword Rank Tracker</title>
      <link rel="stylesheet" href="/assets/tracker.css" />
      <script type="module" src="/assets/tracker.js"></script>
    </head>
    <body>
      <a class="skip-link" href="#scan-title">
        Skip to the scan
      </a>
      <header class="site-header">
        <div class="page-width flex min-h-16 items-center justify-between gap-3">
          <div class="flex items-center gap-2.5">
            <span class="site-mark" aria-hidden="true">
              <i></i>
              <i></i>
              <i></i>
            </span>
            <span class="site-name">Keyword Rank Tracker</span>
          </div>
          <a class="help-link" href="#how-it-works">
            How it works <span class="arrow arrow-down" aria-hidden="true"></span>
          </a>
        </div>
      </header>

      <main class="page-width">
        <section class="intro grid gap-6 py-8 sm:py-11 md:grid-cols-[1fr_auto] md:items-end md:gap-10 lg:py-13">
          <div>
            <h1>See where you rank.</h1>
            <p class="mt-3 max-w-md text-base text-muted sm:text-lg">
              Find where your website appears in Google’s organic results for the keywords you
              choose.
            </p>
          </div>
          <dl class="search-scope md:mb-1">
            <dt>Search location</dt>
            <dd>Indonesia</dd>
          </dl>
        </section>

        <div class="grid items-stretch gap-4 sm:gap-5 min-[880px]:grid-cols-[minmax(20rem,0.83fr)_minmax(0,1.17fr)]">
          <ScanForm />
          <Rankings />
        </div>

        <section
          id="how-it-works"
          class="how-it-works mt-8 grid gap-3 pt-5 pb-9 sm:mt-10 sm:pt-6 md:grid-cols-[minmax(13rem,0.53fr)_minmax(0,1.47fr)] md:gap-8"
        >
          <h2 class="panel-title">How it works</h2>
          <div class="max-w-[69ch] space-y-2 text-sm leading-relaxed text-muted sm:text-base">
            <p>
              The scan checks from page 1 to your chosen depth. A result counts when its URL
              contains the website text you entered. You’ll see the first match for each keyword.
            </p>
            <p>
              Puppeteer uses the server’s browser. Scraping Robot and Serper.dev require server API
              keys.
            </p>
          </div>
        </section>
      </main>
    </body>
  </html>
);
