import { useCallback, useEffect, useRef, useState } from 'react';
import { useToastContext } from '@librechat/client';
import { apiBaseUrl, DEFAULT_OAUTH_STATE_TTL_MS } from 'librechat-data-provider';
import type { TranslationKeys } from '~/hooks';
import { useLocalize } from '~/hooks';

export default function useOpenIDPopup(
  serverDomain: string,
  timeoutMs = DEFAULT_OAUTH_STATE_TTL_MS,
  autoStart = false,
) {
  const localize = useLocalize();
  const { showToast } = useToastContext();
  const cleanupRef = useRef<(() => void) | null>(null);
  const autoAttemptedRef = useRef(false);
  const [pending, setPending] = useState(false);

  useEffect(() => () => cleanupRef.current?.(), []);

  const openPopup = useCallback(() => {
    if (cleanupRef.current) {
      return;
    }
    autoAttemptedRef.current = true;
    const id = Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) =>
      byte.toString(16).padStart(2, '0'),
    ).join('');
    const url = new URL(`${serverDomain.replace(/\/$/, '')}/oauth/openid`, window.location.href);
    url.searchParams.set('popup', id);

    const popup = window.open(url.toString(), `openid-${id}`, 'popup,width=520,height=700');
    if (!popup) {
      showToast({ message: localize('com_auth_popup_blocked'), status: 'error' });
      return;
    }

    setPending(true);
    const cleanup = () => {
      window.removeEventListener('message', onMessage);
      window.clearInterval(interval);
      window.clearTimeout(timeout);
      popup.close();
      cleanupRef.current = null;
    };
    const finish = (error?: TranslationKeys) => {
      cleanup();
      setPending(false);
      if (error) {
        showToast({ message: localize(error), status: 'error' });
        return;
      }
      // Reload through the normal session bootstrap; no tokens cross window boundaries.
      window.location.assign(`${apiBaseUrl()}/`);
    };
    const onMessage = (event: MessageEvent<unknown>) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== popup ||
        typeof event.data !== 'object' ||
        event.data === null ||
        !('type' in event.data) ||
        event.data.type !== 'openid-popup' ||
        !('id' in event.data) ||
        event.data.id !== id ||
        !('success' in event.data) ||
        typeof event.data.success !== 'boolean'
      ) {
        return;
      }
      finish(event.data.success ? undefined : 'com_auth_error_oauth_failed');
    };
    window.addEventListener('message', onMessage);
    const interval = window.setInterval(() => {
      if (popup.closed) {
        finish('com_auth_popup_cancelled');
      }
    }, 500);
    const timeout = window.setTimeout(() => finish('com_auth_popup_timeout'), timeoutMs);
    cleanupRef.current = cleanup;
  }, [serverDomain, timeoutMs, showToast, localize]);

  useEffect(() => {
    if (!autoStart || autoAttemptedRef.current) {
      return;
    }
    // Defer so StrictMode's effect replay cancels the first scheduled attempt.
    const timer = window.setTimeout(() => {
      if (!autoAttemptedRef.current) {
        openPopup();
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [autoStart, openPopup]);

  return { openPopup, pending };
}
