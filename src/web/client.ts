import type { RankingResult, ScraperType } from '../services/keywordRanking.service';
import { INCOMPLETE_RANKINGS_HEADER } from '../types/keywordRanking.types';
import type { KeywordRankingResponse } from '../types/keywordRanking.types';

const SCAN_TIMEOUT = 120_000;
const timeoutMessage = 'The scan timed out after two minutes. Try fewer keywords or pages.';
const providerMessage =
  'The scraper could not complete the scan. Try another scraper or check its server configuration.';
const validationMessages = new Map([
  ['website', 'Enter a website domain or URL.'],
  ['keywords', 'Enter at least one keyword, one per line.'],
  ['page', 'Enter a whole number of pages, starting at 1.'],
  ['scraper', 'Choose one of the available scrapers.'],
]);

class ScanError extends Error {}

const form = document.querySelector<HTMLFormElement>('#rank-form')!;
const websiteField = document.querySelector<HTMLInputElement>('#website')!;
const keywordsField = document.querySelector<HTMLTextAreaElement>('#keywords')!;
const pagesField = document.querySelector<HTMLInputElement>('#pages')!;
const scraperField = document.querySelector<HTMLSelectElement>('#scraper')!;
const button = document.querySelector<HTMLButtonElement>('#scan-button')!;
const buttonLabel = document.querySelector<HTMLElement>('#scan-button-label')!;
const feedback = document.querySelector<HTMLElement>('#scan-feedback')!;
const errorText = document.querySelector<HTMLElement>('#scan-error')!;
const heading = document.querySelector<HTMLElement>('#rankings-title')!;
const summary = document.querySelector<HTMLElement>('#rankings-summary')!;
const table = document.querySelector<HTMLTableElement>('#rankings-table')!;
const rows = document.querySelector<HTMLTableSectionElement>('#ranking-rows')!;
const placeholder = document.querySelector<HTMLElement>('#ranking-placeholder')!;
const stateTitle = document.querySelector<HTMLElement>('#ranking-state-title')!;
const stateMessage = document.querySelector<HTMLElement>('#ranking-state-message')!;
const progress = document.querySelector<HTMLProgressElement>('#scan-progress')!;

function parseHttpUrl(value: string): URL | null {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url : null;
  } catch {
    return null;
  }
}

function isWebsite(value: string): boolean {
  if (!value || /[\s\\]/.test(value)) return false;
  const url = parseHttpUrl(value.includes('://') ? value : `https://${value}`);
  return Boolean(
    url &&
    !url.username &&
    !url.password &&
    (/[^.]+\.[^.]/.test(url.hostname) || url.hostname.startsWith('['))
  );
}

function showFieldError(field: HTMLInputElement | HTMLTextAreaElement, message: string) {
  field.setAttribute('aria-invalid', 'true');
  field.setAttribute('aria-errormessage', 'scan-error');
  errorText.textContent = message;
  field.focus();
}

async function checkPage(
  website: string,
  keywords: string[],
  page: number,
  scraper: ScraperType,
  signal: AbortSignal
): Promise<KeywordRankingResponse> {
  const response = await fetch('/keyword-ranking', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ website, keywords, page, scraper }),
    signal,
  });

  if (response.status === 400) {
    const body = (await response.json().catch(() => null)) as {
      details?: { path?: string[] }[];
    } | null;
    const field = body?.details?.[0]?.path?.[1] ?? '';
    throw new ScanError(validationMessages.get(field) ?? 'Check the scan settings and try again.');
  }
  if (response.status === 408 || response.status === 504) {
    throw new ScanError(
      'The server timed out before the scan finished. Try fewer keywords or pages.'
    );
  }
  if (!response.ok || response.headers.get(INCOMPLETE_RANKINGS_HEADER) === 'true') {
    throw new ScanError(providerMessage);
  }

  return (await response.json()) as KeywordRankingResponse;
}

function renderRows(keywords: string[], ranked: Map<string, RankingResult>, pages: number) {
  const missing = pages === 1 ? 'Not ranked on page 1' : `Not ranked in the first ${pages} pages`;
  const fragment = document.createDocumentFragment();

  for (const keyword of keywords) {
    const row = document.createElement('tr');
    row.setAttribute('role', 'row');
    const label = document.createElement('th');
    label.scope = 'row';
    label.id = `ranking-keyword-${fragment.childElementCount + 1}`;
    label.setAttribute('role', 'rowheader');
    label.headers = 'keyword-column-title';
    label.textContent = keyword;
    row.append(label);

    const result = ranked.get(keyword);
    const rank = row.insertCell();
    rank.setAttribute('role', 'cell');
    rank.headers = `${label.id} rank-column-title`;
    rank.className = result ? 'ranking-number' : 'ranking-missing';
    rank.textContent = result ? String(result.rank) : missing;

    const urlCell = row.insertCell();
    urlCell.setAttribute('role', 'cell');
    urlCell.headers = `${label.id} url-column-title`;
    const url = result?.url;
    if (url && parseHttpUrl(url)) {
      const link = document.createElement('a');
      link.className = 'ranking-link';
      link.href = url;
      link.textContent = url;
      urlCell.append(link);
    } else {
      if (!url) urlCell.className = 'ranking-url-empty';
      urlCell.textContent = url || '—';
    }
    fragment.append(row);
  }

  rows.replaceChildren(fragment);
}

form.addEventListener('input', (event) => {
  const field = event.target;
  if (field instanceof HTMLElement && field.getAttribute('aria-invalid') === 'true') {
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-errormessage');
    errorText.textContent = '';
  }
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (button.disabled) return;

  errorText.textContent = '';
  const website = websiteField.value.trim();
  const keywords = [
    ...new Set(
      keywordsField.value
        .split('\n')
        .map((word) => word.trim())
        .filter(Boolean)
    ),
  ];
  const pages = pagesField.valueAsNumber;
  const scraper = scraperField.value as ScraperType;

  if (!isWebsite(website)) {
    showFieldError(websiteField, 'Enter a website domain or URL.');
    return;
  }
  if (!keywords.length) {
    showFieldError(keywordsField, 'Enter at least one keyword, one per line.');
    return;
  }
  if (!Number.isSafeInteger(pages) || pages < 1) {
    showFieldError(pagesField, 'Enter a whole number of pages, starting at 1.');
    return;
  }

  button.disabled = true;
  buttonLabel.textContent = 'Checking rankings…';
  table.setAttribute('aria-busy', 'true');
  rows.replaceChildren();
  summary.textContent = '';
  placeholder.hidden = false;
  progress.hidden = false;
  progress.max = pages;
  stateTitle.textContent = 'Scan in progress';

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), SCAN_TIMEOUT);
  const pending = new Set(keywords);
  const ranked = new Map<string, RankingResult>();

  try {
    for (let page = 1; page <= pages && pending.size; page += 1) {
      progress.value = page - 1;
      stateMessage.textContent = `Checking Google page ${page} of ${pages}.`;
      feedback.textContent = `Checking page ${page} of ${pages}. This can take a minute or more.`;
      const result = await checkPage(website, [...pending], page, scraper, controller.signal);

      for (const row of result.rankings) {
        if (row.rank !== null && pending.delete(row.keyword)) {
          ranked.set(row.keyword, row);
        }
      }
    }

    renderRows(keywords, ranked, pages);
    summary.textContent = `${website} · ${ranked.size} of ${keywords.length} ranked`;
    placeholder.hidden = true;
    if (document.activeElement === document.body || document.activeElement === button) {
      heading.focus();
    }
  } catch (error) {
    stateTitle.textContent = 'Scan incomplete';
    stateMessage.textContent = 'Try again from the scan form.';
    errorText.textContent = controller.signal.aborted
      ? timeoutMessage
      : error instanceof ScanError
        ? error.message
        : 'The scan could not finish. Check your connection and try again.';
  } finally {
    window.clearTimeout(timer);
    progress.hidden = true;
    feedback.textContent = '';
    table.removeAttribute('aria-busy');
    buttonLabel.textContent = 'Check rankings';
    button.disabled = false;
    if (document.activeElement === document.body) button.focus({ preventScroll: true });
  }
});

button.disabled = false;
