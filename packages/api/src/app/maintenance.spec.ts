import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import type { Request, Response } from 'express';
import { createMaintenanceMiddleware } from './maintenance';

describe('createMaintenanceMiddleware', () => {
  let directory: string;

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), 'maintenance-'));
  });

  afterEach(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  const respond = (
    middleware: ReturnType<typeof createMaintenanceMiddleware>,
    requestPath: string,
  ) => {
    const response = {
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      type: jest.fn().mockReturnThis(),
    };
    const next = jest.fn();

    middleware({ path: requestPath } as Request, response as unknown as Response, next);

    return { next, response };
  };

  const invoke = (requestPath: string, enabled = true) =>
    respond(
      createMaintenanceMiddleware({ enabled, pagePath: join(directory, 'maintenance.html') }),
      requestPath,
    );

  it('passes through when maintenance mode is disabled', () => {
    const { next, response } = invoke('/', false);

    expect(next).toHaveBeenCalledTimes(1);
    expect(response.status).not.toHaveBeenCalled();
  });

  it('serves the mounted HTML with a non-cacheable 503', () => {
    const html = '<!doctype html><title>Maintenance page</title>';
    writeFileSync(join(directory, 'maintenance.html'), html);

    const { next, response } = invoke('/conversations');

    expect(next).not.toHaveBeenCalled();
    expect(response.set).toHaveBeenCalledWith('Cache-Control', 'no-store');
    expect(response.set).toHaveBeenCalledWith(
      'Content-Security-Policy',
      expect.stringContaining('sandbox'),
    );
    expect(response.status).toHaveBeenCalledWith(503);
    expect(response.type).toHaveBeenCalledWith('html');
    expect(response.send).toHaveBeenCalledWith(html);
  });

  it('uses the built-in page when the mounted HTML is missing', () => {
    const { response } = invoke('/');

    expect(response.send).toHaveBeenCalledWith(
      expect.stringContaining('<title>Mantenimiento del servicio</title>'),
    );
  });

  it('uses the bundled page as fallback and reads shared edits on each request', () => {
    const sharedPath = join(directory, 'maintenance.html');
    const fallbackPath = join(directory, 'default.html');
    const middleware = createMaintenanceMiddleware({
      enabled: true,
      pagePath: sharedPath,
      fallbackPagePath: fallbackPath,
    });
    const fallbackHtml = '<!doctype html><title>Bundled default</title>';
    writeFileSync(fallbackPath, fallbackHtml);

    expect(respond(middleware, '/').response.send).toHaveBeenCalledWith(fallbackHtml);

    const updatedHtml = '<!doctype html><title>Edited page</title>';
    writeFileSync(sharedPath, updatedHtml);

    expect(respond(middleware, '/').response.send).toHaveBeenCalledWith(updatedHtml);
  });

  it.each(['/api/config', '/oauth/callback'])('returns a 503 payload for %s', (requestPath) => {
    const { next, response } = invoke(requestPath);

    expect(next).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(503);
    expect(response.json).toHaveBeenCalledWith({
      code: 'SERVICE_MAINTENANCE',
      message: 'Service temporarily unavailable for maintenance.',
    });
    expect(response.send).not.toHaveBeenCalled();
  });

  it('leaves health checks available', () => {
    const health = invoke('/health');

    expect(health.next).toHaveBeenCalledTimes(1);
  });
});
