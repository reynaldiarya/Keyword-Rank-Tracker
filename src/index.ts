import { resolve } from 'node:path';
import { Readable } from 'node:stream';

import { serve } from '@hono/node-server';
import type { HttpBindings } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';

import app from './app';
import { config } from './config/config';

const server = new Hono<{ Bindings: HttpBindings }>();

server.get('/assets/*', serveStatic({ root: resolve(__dirname, '../dist') }));
server.all('*', (c) => {
  const { incoming } = c.env;
  const hasFramedBody =
    incoming.headers['content-length'] !== undefined ||
    incoming.headers['transfer-encoding'] !== undefined;

  return app.fetch(c.req.raw, {
    readLegacyGetBody: hasFramedBody ? () => Readable.toWeb(incoming) : undefined,
  });
});

serve({ fetch: server.fetch, port: config.port, overrideGlobalObjects: false }, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
});
