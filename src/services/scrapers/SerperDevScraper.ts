import axios from 'axios';

import type { SearchScraper, SerpEntry } from '../../types/ScraperInterface';
import type { SerperResponse } from '../../types/SerperTypes';
import { logger } from '../../utils/logger';

// Scraper menggunakan Serper.dev API (Wrapper Google Search)
export class SerperDevScraper implements SearchScraper {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Mengambil hasil pencarian dari Serper.dev
  async fetchResults(keyword: string, start: number = 0): Promise<SerpEntry[]> {
    try {
      // Konversi start (offset) ke halaman (1, 2, 3...)
      const page = Math.floor(start / 10) + 1;

      // Siapkan data request
      const data = JSON.stringify({
        q: keyword,
        gl: 'id', // Lokasi Indonesia
        hl: 'id', // Bahasa Indonesia
        page: page,
      });

      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://google.serper.dev/search',
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
        },
        data: data,
      };

      // Kirim request API
      const response = await axios.request<SerperResponse>(config);

      logger.debug(`SerperDev response status: ${response.status}`);

      // Validasi response punya data organic
      if (!response.data || !response.data.organic) {
        logger.warn(
          `No organic results found for keyword: ${keyword}. Response data: ${JSON.stringify(response.data)}`
        );
        return [];
      }

      logger.debug(`Found ${response.data.organic.length} organic results for keyword: ${keyword}`);

      // Mapping hasil ke format aplikasi
      return response.data.organic.map((item) => ({
        rank: item.position,
        title: item.title,
        url: item.link,
        snippet: item.snippet,
      }));
    } catch (error) {
      logger.error('Error in SerperDevScraper:', error);
      throw error;
    }
  }
}
