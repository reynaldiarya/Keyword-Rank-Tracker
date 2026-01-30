import type { Browser, Page } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import * as cheerio from 'cheerio';

import type { SearchScraper, SerpEntry } from '../../types';

// Menggunakan plugin Stealth untuk menyembunyikan fakta bahwa ini adalah bot Puppeteer
puppeteer.use(StealthPlugin());

export class PuppeteerScraper implements SearchScraper {
  private readonly DEFAULT_USER_AGENT =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  // Menyimpan instance browser agar bisa dipakai berulang kali (hemat RAM)
  private browser: Browser | null = null;

  /**
   * Inisialisasi browser. Langkah ini penting agar kita tidak membuka-tutup browser
   * setiap kali mencari satu keyword, yang akan sangat berat bagi PC.
   */
  async initialize(): Promise<void> {
    // Jika browser sudah ada, jangan buat baru
    if (this.browser) return;

    const browserWsEndpoint = process.env.BROWSER_WS_ENDPOINT;

    // Jika tidak ada endpoint remote, pakai browser lokal saja
    if (!browserWsEndpoint) {
      console.log('No remote browser WS provided, launching local Puppeteer...');
      this.browser = await puppeteer.launch({ headless: true });
    } else {
      // Jika ada endpoint (misal browserless.io), connect ke sana
      this.browser = await puppeteer.connect({
        browserWSEndpoint: browserWsEndpoint,
        defaultViewport: null,
      });
    }
  }

  /**
   * Menutup browser sepenuhnya untuk membersihkan memory.
   * Dipanggil setelah selesai semua proses scraping.
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Fungsi utama untuk mengambil hasil pencarian Google.
   */
  async fetchResults(
    keyword: string,
    start: number = 0,
    lang: string = 'id',
    country: string = 'id'
  ): Promise<SerpEntry[]> {
    // Pastikan browser sudah siap
    if (!this.browser) {
      await this.initialize();
    }

    if (!this.browser) {
      throw new Error('Failed to initialize browser');
    }

    // Buka tab baru
    const page = await this.browser.newPage();

    try {
      const userAgent = process.env.PUPPETEER_USER_AGENT || this.DEFAULT_USER_AGENT;
      const cookie = process.env.PUPPETEER_COOKIE || '';

      // Set User-Agent agar terlihat seperti user asli
      await page.setUserAgent(userAgent);

      // Set Header tambahan agar lebih meyakinkan Google
      const headers: Record<string, string> = {
        'Accept-Language': `${lang}-${country},${lang};q=0.9`,
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        Referer: 'https://www.google.com/',
      };

      if (cookie) {
        headers['Cookie'] = cookie;
      }

      await page.setExtraHTTPHeaders(headers);

      // Set ukuran layar PC standar
      await page.setViewport({ width: 1920, height: 1080 });

      console.log(`🔍 Mencari via Puppeteer: "${keyword}"`);

      // Buka halaman Google Search
      await page.goto(
        `https://www.google.com/search?q=${encodeURIComponent(keyword)}&start=${start}&gl=${country}&hl=${lang}`,
        {
          waitUntil: 'domcontentloaded',
          timeout: 60000,
        }
      );

      // Lakukan gerakan manusia (scroll/mouse) agar tidak terdeteksi bot
      await this.humanBehavior(page);

      // Cek apakah kena Captcha atau blokir
      const isCaptcha = await page.$('iframe[src*="google.com/recaptcha"]');
      const content = await page.content();
      const isUnusual =
        content.includes('lalu lintas yang tidak wajar') || content.includes('unusual traffic');

      if (isCaptcha || isUnusual) {
        console.error('🚨 KENA BLOKIR / CAPTCHA! Ganti IP atau tunggu.');
        throw new Error('Puppeteer Blocked/Captcha detected');
      }

      // Tunggu sampai hasil pencarian muncul (class div.yuRUbf biasanya membungkus hasil)
      try {
        await page.waitForSelector('div.yuRUbf', { timeout: 10000 });
      } catch (e) {
        console.log('⚠️  Selector tidak ditemukan atau kena Captcha/Timeout.', e);
      }

      // Ambil HTML halaman
      const html = await page.content();
      const $ = cheerio.load(html);

      const results: SerpEntry[] = [];

      // Parsing HTML untuk mengambil judul, link, dan snippet
      $('div.yuRUbf').each((i, el) => {
        const titleElement = $(el).find('h3');
        const linkElement = $(el).find('a');
        const snippetElement = $(el).find('div[style*="-webkit-line-clamp"]');

        if (titleElement.length > 0 && linkElement.length > 0) {
          results.push({
            rank: i + 1 + start,
            title: titleElement.text(),
            url: linkElement.attr('href') || '',
            snippet: snippetElement.text().replace(/\s+/g, ' ').trim(),
          });
        }
      });

      return results;
    } catch (error) {
      console.error('Puppeteer Error:', error);
      throw error;
    } finally {
      // Tutup tab (page) saja, JANGAN tutup browser agar bisa dipakai lagi
      await page.close();
    }
  }

  /**
   * Simulasi perilaku manusia sederhana (gerakan mouse acak & scroll).
   */
  private async humanBehavior(page: Page) {
    try {
      await page.mouse.move(Math.random() * 1000, Math.random() * 500);
      await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight / 2);
      });
      await new Promise((r) => setTimeout(r, Math.floor(Math.random() * 2000) + 1000));
    } catch (e) {
      console.error('Puppeteer Error:', e);
    }
  }
}
