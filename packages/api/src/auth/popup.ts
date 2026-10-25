import type { Request, Response, NextFunction } from 'express';
import { isEnabled } from '~/utils/common';

type LoginMode = 'redirect' | 'popup';
type Registration = { openidLoginMode?: LoginMode };

const popupIdPattern = /^[a-f0-9]{32}$/;
const popupStatePrefix = 'openid-popup.';

export function shouldGenerateOpenIDNonce(state: unknown, envFlag?: string): boolean {
  // openid-client replaces state for providers not advertising PKCE unless a nonce is present.
  return isEnabled(envFlag) || (typeof state === 'string' && state.startsWith(popupStatePrefix));
}

export function resolveOpenIDLoginMode(registration?: Registration, envMode?: string): LoginMode {
  const mode = registration?.openidLoginMode ?? envMode?.trim() ?? 'redirect';
  if (mode === '' || mode === 'redirect') {
    return 'redirect';
  }
  if (mode === 'popup') {
    return mode;
  }
  throw new Error('OPENID_LOGIN_MODE must be redirect or popup');
}

interface LoginDependencies {
  passport: {
    authenticate: (
      strategy: string,
      options: { session: false; state: string },
    ) => (req: Request, res: Response, next: NextFunction) => unknown;
  };
  randomState: () => string;
  getAppConfig: (
    options: { baseOnly: true } | { tenantId: string },
  ) => Promise<{ registration?: Registration } | null | undefined>;
  getTenantId: () => string | undefined;
  envMode?: string;
}

export function createOpenIDLoginHandler({
  passport,
  randomState,
  getAppConfig,
  getTenantId,
  envMode,
}: LoginDependencies) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      let state = randomState();
      const popupId = req.query.popup;
      if (popupId != null) {
        if (typeof popupId !== 'string' || !popupIdPattern.test(popupId)) {
          throw new Error('Invalid OpenID popup correlation');
        }
        const tenantId = getTenantId();
        const config = await getAppConfig(tenantId ? { tenantId } : { baseOnly: true });
        if (resolveOpenIDLoginMode(config?.registration, envMode) !== 'popup') {
          throw new Error('OpenID popup login is disabled');
        }
        // Passport binds the entire state, including this correlation, to its session.
        state = `${popupStatePrefix}${popupId}.${state}`;
      }
      passport.authenticate('openid', { session: false, state })(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

/** Only a correlation, never proof of authentication; Passport must still validate state. */
export function captureOpenIDPopup(req: Request, res: Response, next: NextFunction): void {
  const state = req.query.state;
  if (typeof state === 'string' && state.startsWith(popupStatePrefix)) {
    const [popupId, entropy, ...rest] = state.slice(popupStatePrefix.length).split('.');
    if (popupIdPattern.test(popupId) && entropy && rest.length === 0) {
      res.locals.openidPopupId = popupId;
    }
  }
  next();
}

export function getOpenIDPopupRedirect(
  res: Response,
  clientDomain: string | undefined,
  error?: string,
): string | undefined {
  const popupId: unknown = res.locals?.openidPopupId;
  if (typeof popupId !== 'string' || !popupIdPattern.test(popupId)) {
    return undefined;
  }
  const url = new URL(`${clientDomain?.replace(/\/$/, '')}/oauth/openid/popup`);
  url.searchParams.set('id', popupId);
  if (error) {
    url.searchParams.set('error', error);
  }
  return url.toString();
}

export function redirectOpenIDResult(
  res: Response,
  {
    clientDomain,
    redirectUri,
    error,
  }: { clientDomain?: string; redirectUri: string; error?: string },
): void {
  res.redirect(getOpenIDPopupRedirect(res, clientDomain ?? redirectUri, error) ?? redirectUri);
}
