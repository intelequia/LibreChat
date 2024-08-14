import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useGetStartupConfig } from 'librechat-data-provider/react-query';
import type { TStartupConfig } from 'librechat-data-provider';
import AuthLayout from '~/components/Auth/AuthLayout';
import { useLocalize } from '~/hooks';

const headerMap = {
  '/login': 'com_auth_welcome_back',
  '/register': 'com_auth_create_account',
  '/forgot-password': 'com_auth_reset_password',
  '/reset-password': 'com_auth_reset_password',
};

export default function StartupLayout({ isAuthenticated }: { isAuthenticated?: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const [headerText, setHeaderText] = useState<string | null>(null);
  const [startupConfig, setStartupConfig] = useState<TStartupConfig | null>(null);
  const {
    data,
    isFetching,
    error: startupConfigError,
  } = useGetStartupConfig({
    enabled: isAuthenticated ? startupConfig === null : true,
  });
  const localize = useLocalize();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.title = startupConfig?.appTitle || 'Intelewriter';

    const favicon32 = document.getElementById('favicon32');
    const favicon16 = document.getElementById('favicon16');

    if (favicon32 && favicon16) {
      favicon32.setAttribute('href', startupConfig?.favicon32 || '');
      favicon16.setAttribute('href', startupConfig?.favicon16 || '');
      localStorage.setItem('favicon32', startupConfig?.favicon32 || '');
      localStorage.setItem('favicon16', startupConfig?.favicon16 || '');
    }

    localStorage.setItem(
      'userAssistantConfigPermission',
      '' + startupConfig?.userAssistantConfigPermission,
    );
  }, [startupConfig]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/c/new', { replace: true });
    }
    if (data) {
      setStartupConfig(data);
    }
  }, [isAuthenticated, navigate, data]);

  useEffect(() => {
    setError(null);
    setHeaderText(null);
  }, [location.pathname]);

  const contextValue = {
    error,
    setError,
    headerText,
    setHeaderText,
    startupConfigError,
    startupConfig,
    isFetching,
  };

  return (
    <AuthLayout
      header={headerText ? localize(headerText) : localize(headerMap[location.pathname])}
      isFetching={isFetching}
      startupConfig={startupConfig}
      startupConfigError={startupConfigError}
      pathname={location.pathname}
      error={error}
    >
      <Outlet context={contextValue} />
    </AuthLayout>
  );
}
