import axios from 'axios';

import type { SearchScraper, SerpEntry, SerperResponse } from '../../types';
import { logger } from '../../utils';

// Scraper using the Serper.dev API (Google Search API wrapper)
export class SerperDevScraper implements SearchScraper {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Retrieves search results from Serper.dev
  async fetchResults(keyword: string, start: number = 0): Promise<SerpEntry[]> {
    try {
      // Convert start offset to page number (1, 2, 3...)
      const page = Math.floor(start / 10) + 1;

      // Prepare request payload
      const data = JSON.stringify({
        q: keyword,
        gl: 'id', // Geographic location: Indonesia
        hl: 'id', // Interface language: Indonesian
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

      // Send the API request
      const response = await axios.request<SerperResponse>(config);

      logger.debug(`SerperDev response status: ${response.status}`);

      // Ensure the response contains organic search results
      if (!response.data || !response.data.organic) {
        logger.warn(
          `No organic results found for keyword: ${keyword}. Response data: ${JSON.stringify(response.data)}`
        );
        return [];
      }

      logger.debug(`Found ${response.data.organic.length} organic results for keyword: ${keyword}`);

      // Map results to the application format
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
