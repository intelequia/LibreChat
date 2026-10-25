/**
 * @jest-environment @happy-dom/jest-environment
 */
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import OpenIDPopup from './OpenIDPopup';

jest.mock('~/hooks', () => ({
  useLocalize: () => (key: string) => key,
}));

describe('OpenID popup completion', () => {
  const postMessage = jest.fn();
  beforeEach(() => {
    postMessage.mockClear();
    jest.spyOn(window, 'opener', 'get').mockReturnValue({ postMessage });
  });

  it.each([false, true])('notifies only the client origin (error=%s)', (error) => {
    const id = 'a'.repeat(32);
    render(
      <MemoryRouter
        initialEntries={[`/oauth/openid/popup?id=${id}${error ? '&error=auth_failed' : ''}`]}
      >
        <OpenIDPopup />
      </MemoryRouter>,
    );
    expect(postMessage).toHaveBeenCalledWith(
      { type: 'openid-popup', id, success: !error },
      window.location.origin,
    );
    expect(screen.getByRole('button')).toHaveTextContent('com_ui_close_window');
  });

  it('does not report completion without a valid correlation', () => {
    render(
      <MemoryRouter initialEntries={['/oauth/openid/popup?id=invalid']}>
        <OpenIDPopup />
      </MemoryRouter>,
    );
    expect(postMessage).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent('com_auth_error_oauth_failed');
  });
});
