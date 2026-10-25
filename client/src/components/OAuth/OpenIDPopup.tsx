import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLocalize } from '~/hooks';

export default function OpenIDPopup() {
  const localize = useLocalize();
  const [params] = useSearchParams();
  const id = params.get('id');
  const success = !params.has('error');
  const valid = id != null && /^[a-f0-9]{32}$/.test(id);

  useEffect(() => {
    if (!valid || !window.opener) {
      return;
    }
    window.opener.postMessage({ type: 'openid-popup', id, success }, window.location.origin);
    // The opener closes this window after receiving the notification.
  }, [id, success, valid]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-primary p-6 text-text-primary">
      <div role="status" className="text-center">
        <p>
          {localize(
            valid && success ? 'com_ui_oauth_success_title' : 'com_auth_error_oauth_failed',
          )}
        </p>
        <button
          type="button"
          className="mt-4 text-accent-primary underline"
          onClick={() => window.close()}
        >
          {localize('com_ui_close_window')}
        </button>
      </div>
    </main>
  );
}
