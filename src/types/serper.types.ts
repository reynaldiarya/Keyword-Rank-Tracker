/**
 * Interface hasil pencarian individual dari Serper.dev
 */
export interface SerperOrganicResult {
  title: string;
  link: string;
  snippet: string;
  position: number;
}

/**
 * Interface response utama API Serper.dev
 */
export interface SerperResponse {
  organic: SerperOrganicResult[];
}
