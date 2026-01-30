export interface SerpEntry {
  rank: number;
  title: string;
  url: string;
  snippet: string;
}

export interface SearchScraper {
  initialize?(): Promise<void>;
  close?(): Promise<void>;
  fetchResults(
    keyword: string,
    start: number,
    lang?: string,
    country?: string
  ): Promise<SerpEntry[]>;
}
