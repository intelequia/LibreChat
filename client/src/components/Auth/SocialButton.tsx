import React from 'react';
import useOpenIDPopup from './useOpenIDPopup';

interface SocialButtonProps {
  id: string;
  enabled: boolean;
  serverDomain: string;
  oauthPath: string;
  Icon: React.ComponentType;
  label: string;
  loginMode?: 'redirect' | 'popup';
  oauthStateTtlMs?: number;
  autoStart?: boolean;
}

const SocialButton = ({
  id,
  enabled,
  serverDomain,
  oauthPath,
  Icon,
  label,
  loginMode,
  oauthStateTtlMs,
  autoStart = false,
}: SocialButtonProps) => {
  const { openPopup, pending } = useOpenIDPopup(
    serverDomain,
    oauthStateTtlMs,
    enabled && oauthPath === 'openid' && loginMode === 'popup' && autoStart,
  );
  if (!enabled) {
    return null;
  }

  if (oauthPath === 'openid' && loginMode === 'popup') {
    return (
      <div className="mt-2 flex gap-x-2">
        <button
          type="button"
          aria-label={label}
          aria-busy={pending}
          disabled={pending}
          className="flex w-full items-center space-x-3 rounded-2xl border border-border-light bg-surface-primary px-5 py-3 text-text-primary transition-colors duration-200 hover:bg-surface-tertiary disabled:cursor-wait disabled:opacity-50"
          onClick={openPopup}
          data-testid={id}
        >
          <Icon />
          <p>{label}</p>
        </button>
      </div>
    );
  }

  return (
    <div className="mt-2 flex gap-x-2">
      <a
        aria-label={`${label}`}
        className="border-border-light bg-surface-primary text-text-primary hover:bg-surface-tertiary flex w-full items-center space-x-3 rounded-2xl border px-5 py-3 transition-colors duration-200"
        href={`${serverDomain}/oauth/${oauthPath}`}
        data-testid={id}
      >
        <Icon />
        <p>{label}</p>
      </a>
    </div>
  );
};

export default SocialButton;
