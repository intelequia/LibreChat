import { readFileSync } from 'node:fs';
import type { RequestHandler } from 'express';

const DEFAULT_MAINTENANCE_HTML = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <title>Mantenimiento del servicio</title>
  </head>
  <body>
    <main>
      <p>MANTENIMIENTO DEL SERVICIO</p>
      <h1>Volvemos en breve.</h1>
      <p>El servicio está temporalmente detenido. Vuelve a intentarlo en unos minutos.</p>
    </main>
  </body>
</html>`;

const PASSTHROUGH_PATHS = new Set(['/health', '/livez', '/readyz']);
const MAINTENANCE_CSP = [
  "default-src 'none'",
  "style-src 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  'sandbox',
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join('; ');

export interface MaintenanceOptions {
  enabled?: boolean;
  pagePath?: string;
  fallbackPagePath?: string;
}

export const createMaintenanceMiddleware = ({
  enabled = false,
  pagePath,
  fallbackPagePath,
}: MaintenanceOptions = {}): RequestHandler => {
  const readMaintenanceHtml = (): string => {
    const candidates = new Set(
      [pagePath, fallbackPagePath].filter((candidate): candidate is string => !!candidate),
    );
    for (const candidate of candidates) {
      try {
        return readFileSync(candidate, 'utf8');
      } catch {
        continue;
      }
    }
    return DEFAULT_MAINTENANCE_HTML;
  };

  return (req, res, next) => {
    if (!enabled || PASSTHROUGH_PATHS.has(req.path)) {
      return next();
    }

    res.set('Cache-Control', 'no-store');

    if (
      req.path === '/api' ||
      req.path.startsWith('/api/') ||
      req.path === '/oauth' ||
      req.path.startsWith('/oauth/')
    ) {
      return res.status(503).json({
        code: 'SERVICE_MAINTENANCE',
        message: 'Service temporarily unavailable for maintenance.',
      });
    }

    res.set('Content-Security-Policy', MAINTENANCE_CSP);
    return res.status(503).type('html').send(readMaintenanceHtml());
  };
};
