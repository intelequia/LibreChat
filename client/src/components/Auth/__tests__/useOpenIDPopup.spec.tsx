/**
 * @jest-environment @happy-dom/jest-environment
 */
import { StrictMode } from 'react';
import { act, render, renderHook, screen } from '@testing-library/react';
import useOpenIDPopup from '../useOpenIDPopup';
import SocialButton from '../SocialButton';

const mockShowToast = jest.fn();
jest.mock('@librechat/client', () => ({
  useToastContext: () => ({ showToast: mockShowToast }),
}));
jest.mock('~/hooks', () => ({
  useLocalize: () => (key: string) => key,
}));

describe('OpenID popup client', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.useRealTimers();
    document.querySelectorAll('iframe[data-openid-test]').forEach((frame) => frame.remove());
  });

  const createPopup = () => {
    const frame = document.createElement('iframe');
    frame.dataset.openidTest = 'true';
    document.body.appendChild(frame);
    const popup = frame.contentWindow;
    if (!popup) {
      throw new Error('Test popup window could not be created');
    }
    jest.spyOn(popup, 'close').mockImplementation(() => {});
    jest.spyOn(window, 'open').mockReturnValue(popup);
    return popup;
  };

  const setup = (timeoutMs?: number) => {
    const popup = createPopup();
    const result = renderHook(() => useOpenIDPopup('https://server.example.com', timeoutMs));
    const initialTimers = jest.getTimerCount();
    act(() => result.result.current.openPopup());
    const url = new URL(jest.mocked(window.open).mock.calls[0][0]!.toString());
    return { ...result, popup, id: url.searchParams.get('popup'), initialTimers };
  };

  it('opens the backend flow synchronously and prevents duplicate attempts', () => {
    const { result } = setup();
    expect(window.open).toHaveBeenCalledWith(
      expect.stringMatching(/^https:\/\/server\.example\.com\/oauth\/openid\?popup=[a-f0-9]{32}$/),
      expect.any(String),
      'popup,width=520,height=700',
    );
    expect(result.current.pending).toBe(true);
    act(() => result.current.openPopup());
    expect(window.open).toHaveBeenCalledTimes(1);
  });

  it('reports blocked popups without redirecting the iframe', () => {
    jest.spyOn(window, 'open').mockReturnValue(null);
    const { result } = renderHook(() => useOpenIDPopup('https://server.example.com'));
    act(() => result.current.openPopup());
    expect(result.current.pending).toBe(false);
    expect(mockShowToast).toHaveBeenCalledWith({
      message: 'com_auth_popup_blocked',
      status: 'error',
    });
  });

  it('attempts automatic login only after it is enabled, once despite rerenders', () => {
    createPopup();
    const { result, rerender } = renderHook(
      ({ autoStart }) => useOpenIDPopup('https://server.example.com', undefined, autoStart),
      { initialProps: { autoStart: false } },
    );
    act(() => jest.advanceTimersByTime(0));
    expect(window.open).not.toHaveBeenCalled();
    rerender({ autoStart: true });
    act(() => jest.advanceTimersByTime(0));
    expect(window.open).toHaveBeenCalledTimes(1);
    expect(result.current.pending).toBe(true);
    rerender({ autoStart: false });
    rerender({ autoStart: true });
    act(() => jest.advanceTimersByTime(0));
    expect(window.open).toHaveBeenCalledTimes(1);
  });

  it('does not retry blocked automatic popups but allows a manual retry', () => {
    jest.spyOn(window, 'open').mockReturnValue(null);
    const { result, rerender } = renderHook(() =>
      useOpenIDPopup('https://server.example.com', undefined, true),
    );
    act(() => jest.advanceTimersByTime(0));
    expect(window.open).toHaveBeenCalledTimes(1);
    expect(mockShowToast).toHaveBeenCalledWith({
      message: 'com_auth_popup_blocked',
      status: 'error',
    });
    rerender();
    act(() => jest.advanceTimersByTime(0));
    expect(window.open).toHaveBeenCalledTimes(1);
    const popup = createPopup();
    act(() => result.current.openPopup());
    expect(window.open).toHaveBeenCalledTimes(2);
    expect(result.current.pending).toBe(true);
    expect(popup.close).not.toHaveBeenCalled();
  });

  it('does not reopen an automatic popup after cancellation', () => {
    const popup = createPopup();
    const { result, rerender } = renderHook(() =>
      useOpenIDPopup('https://server.example.com', undefined, true),
    );
    act(() => jest.advanceTimersByTime(0));
    Object.defineProperty(popup, 'closed', { value: true });
    act(() => jest.advanceTimersByTime(500));
    rerender();
    act(() => jest.advanceTimersByTime(0));
    expect(result.current.pending).toBe(false);
    expect(window.open).toHaveBeenCalledTimes(1);
    expect(mockShowToast).toHaveBeenCalledWith({
      message: 'com_auth_popup_cancelled',
      status: 'error',
    });
  });

  it('opens once and keeps the popup alive under StrictMode effect replay', () => {
    const popup = createPopup();
    const { result, unmount } = renderHook(
      () => useOpenIDPopup('https://server.example.com', undefined, true),
      { wrapper: StrictMode },
    );
    act(() => jest.advanceTimersByTime(0));
    expect(window.open).toHaveBeenCalledTimes(1);
    expect(popup.close).not.toHaveBeenCalled();
    expect(result.current.pending).toBe(true);
    unmount();
    expect(popup.close).toHaveBeenCalledTimes(1);
  });

  it('ignores messages from another origin, window, correlation or invalid payload', () => {
    const { result, popup, id } = setup();
    const assign = jest.spyOn(window.location, 'assign').mockImplementation(() => {});
    const data = { type: 'openid-popup', id, success: true };
    for (const options of [
      { origin: 'https://evil.example.com', source: popup, data },
      { origin: window.location.origin, source: window, data },
      { origin: window.location.origin, source: popup, data: { ...data, id: 'wrong' } },
      { origin: window.location.origin, source: popup, data: { ...data, success: 'true' } },
      { origin: window.location.origin, source: popup, data: null },
    ]) {
      act(() => window.dispatchEvent(new MessageEvent<unknown>('message', options)));
    }
    expect(assign).not.toHaveBeenCalled();
    expect(result.current.pending).toBe(true);
  });

  it('restarts normal session bootstrap only on a valid success notification', () => {
    const { popup, id, result } = setup();
    const assign = jest.spyOn(window.location, 'assign').mockImplementation(() => {});
    act(() =>
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: window.location.origin,
          source: popup,
          data: { type: 'openid-popup', id, success: true },
        }),
      ),
    );
    expect(assign).toHaveBeenCalledWith('/');
    expect(popup.close).toHaveBeenCalled();
    expect(result.current.pending).toBe(false);
  });

  it('reports provider failure and allows retry', () => {
    const { popup, id, result } = setup();
    act(() =>
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: window.location.origin,
          source: popup,
          data: { type: 'openid-popup', id, success: false },
        }),
      ),
    );
    expect(mockShowToast).toHaveBeenCalledWith({
      message: 'com_auth_error_oauth_failed',
      status: 'error',
    });
    expect(result.current.pending).toBe(false);
  });

  it('reports cancellation and cleans up the attempt', () => {
    const { popup, result } = setup();
    Object.defineProperty(popup, 'closed', { value: true });
    act(() => jest.advanceTimersByTime(500));
    expect(result.current.pending).toBe(false);
    expect(mockShowToast).toHaveBeenCalledWith({
      message: 'com_auth_popup_cancelled',
      status: 'error',
    });
  });

  it('reports timeout and closes the popup', () => {
    const { popup } = setup();
    act(() => jest.advanceTimersByTime(10 * 60 * 1000));
    expect(popup.close).toHaveBeenCalled();
    expect(mockShowToast).toHaveBeenCalledWith({
      message: 'com_auth_popup_timeout',
      status: 'error',
    });
  });

  it('honors the configured OAuth transaction timeout', () => {
    const { result } = setup(60_000);
    act(() => jest.advanceTimersByTime(59_999));
    expect(result.current.pending).toBe(true);
    act(() => jest.advanceTimersByTime(1));
    expect(result.current.pending).toBe(false);
    expect(mockShowToast).toHaveBeenCalledWith({
      message: 'com_auth_popup_timeout',
      status: 'error',
    });
  });

  it('cleans up listeners, timers and popup on unmount', () => {
    const { popup, unmount, initialTimers } = setup();
    unmount();
    expect(popup.close).toHaveBeenCalled();
    expect(jest.getTimerCount()).toBe(initialTimers);
  });

  it('keeps other providers and the default mode as ordinary links', () => {
    jest.spyOn(window, 'open').mockReturnValue(null);
    const props = {
      id: 'provider',
      enabled: true,
      serverDomain: 'https://server.example.com',
      Icon: () => <span />,
      label: 'Sign in',
    };
    const { rerender } = render(<SocialButton {...props} oauthPath="openid" autoStart />);
    act(() => jest.advanceTimersByTime(0));
    expect(window.open).not.toHaveBeenCalled();
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'https://server.example.com/oauth/openid',
    );
    rerender(<SocialButton {...props} oauthPath="google" loginMode="popup" autoStart />);
    act(() => jest.advanceTimersByTime(0));
    expect(window.open).not.toHaveBeenCalled();
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'https://server.example.com/oauth/google',
    );
    rerender(<SocialButton {...props} oauthPath="openid" loginMode="popup" />);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('does not automatically open a disabled provider', () => {
    jest.spyOn(window, 'open').mockReturnValue(null);
    render(
      <SocialButton
        id="openid"
        enabled={false}
        serverDomain="https://server.example.com"
        oauthPath="openid"
        Icon={() => <span />}
        label="Sign in"
        loginMode="popup"
        autoStart
      />,
    );
    act(() => jest.advanceTimersByTime(0));
    expect(window.open).not.toHaveBeenCalled();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
