import { useLocalize } from '~/hooks';
import { TStartupConfig } from 'librechat-data-provider';
import { ThemeContext } from '~/hooks';
import { useContext } from 'react';

function Footer({ startupConfig }: { startupConfig: TStartupConfig | null | undefined }) {
  const localize = useLocalize();
  const { theme } = useContext(ThemeContext);
  
  if (!startupConfig) {
    return null;
  }
  const privacyPolicy = startupConfig.interface?.privacyPolicy;
  const termsOfService = startupConfig.interface?.termsOfService;

  const privacyPolicyRender = privacyPolicy?.externalUrl && (
    <a
      className="text-sm text-green-500"
      href={privacyPolicy.externalUrl}
      target={privacyPolicy.openNewTab ? '_blank' : undefined}
      rel="noreferrer"
    >
      {localize('com_ui_privacy_policy')}
    </a>
  );

  const termsOfServiceRender = termsOfService?.externalUrl && (
    <a
      className="text-sm text-green-500"
      href={termsOfService.externalUrl}
      target={termsOfService.openNewTab ? '_blank' : undefined}
      rel="noreferrer"
    >
      {localize('com_ui_terms_of_service')}
    </a>
  );

  return (
    <>
      <div className="align-end m-4 flex justify-center gap-2">
        {privacyPolicyRender}
        {privacyPolicyRender && termsOfServiceRender && (
          <div className="border-r-[1px] border-gray-300 dark:border-gray-600" />
        )}
        {termsOfServiceRender}
      </div>
      <div className="align-end m-2 flex justify-center gap-2">
        <h2 style={{color:theme === 'dark' ? 'white' : 'black' }}>Intelewriter is a product of Intelequia Technologies, S.L.</h2>
      </div>
    </>
  );
}

export default Footer;
