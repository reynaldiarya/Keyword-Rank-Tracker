/**
 * Represents an individual organic search result item from Serper.dev.
 */
export interface SerperOrganicResult {
  title: string;
  link: string;
  snippet: string;
  position: number;
}

/**
 * Represents the main API response format from Serper.dev.
 */
export interface SerperResponse {
  organic: SerperOrganicResult[];
}
