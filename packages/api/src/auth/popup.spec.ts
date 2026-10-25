import express from 'express';
import request from 'supertest';
import type { Request, Response, NextFunction } from 'express';
import {
  captureOpenIDPopup,
  createOpenIDLoginHandler,
  redirectOpenIDResult,
  resolveOpenIDLoginMode,
  shouldGenerateOpenIDNonce,
} from './popup';
import { redirectToAuthFailure } from '~/oauth/callback';

const id = 'a'.repeat(32);

function createApp(mode?: string, registration?: { openidLoginMode?: 'redirect' | 'popup' }) {
  const passport = {
    authenticate: jest.fn(
      (_strategy: string, options: { session: false; state: string }) =>
        (_req: Request, res: Response) => {
          res.json(options);
        },
    ),
  };
  const getAppConfig = jest.fn().mockResolvedValue({ registration });
  const app = express();
  app.get(
    '/openid',
    createOpenIDLoginHandler({
      passport,
      getAppConfig,
      getTenantId: () => undefined,
      randomState: () => 'server-entropy',
      envMode: mode,
    }),
  );
  app.use('/callback', captureOpenIDPopup);
  app.get('/callback', (_req, res) =>
    redirectOpenIDResult(res, {
      clientDomain: 'https://ai.example.com/chat',
      redirectUri: 'https://ai.example.com/chat',
    }),
  );
  app.get('/callback/error', (_req, res) =>
    redirectToAuthFailure(res, {
      clientDomain: 'https://ai.example.com/chat',
      authFailedError: 'auth_failed',
    }),
  );
  app.use((error: Error, _req: Request, res: Response, _next: NextFunction) =>
    res.status(400).json({ message: error.message }),
  );
  return { app, passport, getAppConfig };
}

describe('OpenID popup login', () => {
  it('preserves redirect by default and validates mode configuration', () => {
    expect(resolveOpenIDLoginMode()).toBe('redirect');
    expect(resolveOpenIDLoginMode(undefined, '')).toBe('redirect');
    expect(resolveOpenIDLoginMode(undefined, 'popup')).toBe('popup');
    expect(resolveOpenIDLoginMode({ openidLoginMode: 'redirect' }, 'popup')).toBe('redirect');
    expect(() => resolveOpenIDLoginMode(undefined, 'invalid')).toThrow('OPENID_LOGIN_MODE');
  });

  it('does not add config reads or alter state for ordinary login', async () => {
    const { app, getAppConfig } = createApp();
    const response = await request(app).get('/openid').expect(200);
    expect(response.body).toEqual({ session: false, state: 'server-entropy' });
    expect(getAppConfig).not.toHaveBeenCalled();
  });

  it('binds the popup correlation and fresh entropy to Passport state', async () => {
    const { app, getAppConfig } = createApp('popup');
    const response = await request(app).get(`/openid?popup=${id}`).expect(200);
    expect(response.body.state).toBe(`openid-popup.${id}.server-entropy`);
    expect(getAppConfig).toHaveBeenCalledWith({ baseOnly: true });
  });

  it('honors YAML over the environment', async () => {
    const { app } = createApp('redirect', { openidLoginMode: 'popup' });
    const response = await request(app).get(`/openid?popup=${id}`).expect(200);
    expect(response.body.state).toBe(`openid-popup.${id}.server-entropy`);
  });

  it('allows provider SSO without forcing login or account selection', async () => {
    const { app, passport } = createApp('popup');
    await request(app).get(`/openid?popup=${id}`).expect(200);
    expect(passport.authenticate).toHaveBeenCalledWith('openid', {
      session: false,
      state: `openid-popup.${id}.server-entropy`,
    });
    expect(passport.authenticate.mock.calls[0][1]).not.toHaveProperty('prompt');
  });

  it.each(['invalid', '../other', 'a'.repeat(33)])(
    'rejects invalid correlations: %s',
    async (popup) => {
      const { app, passport } = createApp('popup');
      await request(app).get('/openid').query({ popup }).expect(400);
      expect(passport.authenticate).not.toHaveBeenCalled();
    },
  );

  it('rejects popup login when disabled', async () => {
    const { app, passport } = createApp();
    await request(app).get(`/openid?popup=${id}`).expect(400);
    expect(passport.authenticate).not.toHaveBeenCalled();
  });

  it('returns success to the fixed client completion route without tokens', async () => {
    const { app } = createApp('popup');
    const response = await request(app)
      .get('/callback')
      .query({ state: `openid-popup.${id}.server-entropy`, code: 'secret-code' })
      .expect(302);
    expect(response.headers.location).toBe(
      `https://ai.example.com/chat/oauth/openid/popup?id=${id}`,
    );
    expect(response.headers.location).not.toContain('secret');
  });

  it('returns provider failures to the popup, not another login inside it', async () => {
    const { app } = createApp('popup');
    const response = await request(app)
      .get('/callback/error')
      .query({ state: `openid-popup.${id}.server-entropy`, error_description: 'private details' })
      .expect(302);
    expect(response.headers.location).toBe(
      `https://ai.example.com/chat/oauth/openid/popup?id=${id}&error=auth_failed`,
    );
  });

  it.each(['ordinary-state', `openid-popup.${id}`, 'openid-popup.invalid.entropy'])(
    'does not treat an ordinary or malformed state as a popup: %s',
    async (state) => {
      const { app } = createApp();
      const response = await request(app).get('/callback').query({ state }).expect(302);
      expect(response.headers.location).toBe('https://ai.example.com/chat');
    },
  );

  it('keeps the popup state intact when a provider does not advertise PKCE', () => {
    expect(shouldGenerateOpenIDNonce(`openid-popup.${id}.entropy`)).toBe(true);
    expect(shouldGenerateOpenIDNonce('ordinary-state')).toBe(false);
    expect(shouldGenerateOpenIDNonce('ordinary-state', 'true')).toBe(true);
  });
});
