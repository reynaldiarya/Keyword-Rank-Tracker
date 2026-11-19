import type { MiddlewareHandler } from 'hono';

import type { AppEnv } from '../types/app.types';

const JSON_LIMIT = 100 * 1024;
const encodings = new Map([
  ['gzip', 'gzip'],
  ['deflate', 'deflate'],
  ['br', 'brotli'],
] as const);

export const prepareRankingBody: MiddlewareHandler<AppEnv> = async (c, next) => {
  const contentType = c.req.header('Content-Type') ?? '';
  if (!/^application\/json\s*(?:;|$)/i.test(contentType)) {
    c.req.bodyCache.json = Promise.resolve({});
    return next();
  }

  // Fetch requests cannot carry a GET body. The Node adapter can supply its original stream.
  const legacyBody = c.req.method === 'GET' ? c.env?.readLegacyGetBody?.() : undefined;
  const body = legacyBody ?? c.req.raw.body;
  if (!body) {
    c.req.bodyCache.json = Promise.resolve({});
    return next();
  }

  const charset = /;\s*charset\s*=\s*"?([^";\s]+)/i.exec(contentType)?.[1] ?? 'utf-8';
  if (!/^utf-/i.test(charset)) {
    throw new Error(`Unsupported JSON charset: ${charset}`);
  }

  const encoding = c.req.header('Content-Encoding')?.toLowerCase() ?? 'identity';
  const format = encodings.get(encoding as 'gzip' | 'deflate' | 'br');
  if (encoding !== 'identity' && !format) {
    throw new Error(`Unsupported JSON content encoding: ${encoding}`);
  }

  // Node supports Brotli here even though the DOM type does not list it.
  const stream = format
    ? body.pipeThrough(new DecompressionStream(format as CompressionFormat))
    : body;
  const reader = stream.getReader();
  const decoder = new TextDecoder(charset);
  let size = 0;
  let text = '';

  try {
    for (let chunk = await reader.read(); !chunk.done; chunk = await reader.read()) {
      size += chunk.value.byteLength;
      if (size > JSON_LIMIT) {
        throw new Error('Request entity too large');
      }
      text += decoder.decode(chunk.value, { stream: true });
    }
    text += decoder.decode();
  } finally {
    reader.releaseLock();
  }

  // Match the Express JSON parser's object/array requirement and preserve its schema paths.
  if (text && !/^[\t\n\r ]*(?:\{|\[)/.test(text)) {
    throw new Error('Malformed JSON in request body');
  }
  const payload: unknown = JSON.parse(text || '{}');
  c.req.bodyCache.json = Promise.resolve({ body: payload });
  return next();
};
