const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { logger } = require('@librechat/data-schemas');
const { isEnabled, getBalanceConfig } = require('@librechat/api');
const { Constants, CacheKeys, defaultSocialLogins } = require('librechat-data-provider');
const { getLdapConfig } = require('~/server/services/Config/ldap');
const { getAppConfig } = require('~/server/services/Config/app');
const { getProjectByName } = require('~/models/Project');
const { getLogStores } = require('~/cache');

const router = express.Router();

/**
 * //Intelequia - Carga el HTML personalizado del header
 * @param {string} htmlPath - Ruta relativa a la carpeta public del cliente
 * @returns {Promise<string|null>} - Contenido HTML o null si no existe
 */
const loadBusinessHeaderHTML = async (htmlPath) => {
  try {
    // //Intelequia - __dirname is api/server/routes/, need to go up 3 levels to reach project root
    const defaultPath = path.join(__dirname, '../../../client/public/business-header/index.html');
    const resolvedPath = htmlPath ? path.join(__dirname, '../../../client/public', htmlPath) : defaultPath;

    const htmlContent = await fs.readFile(resolvedPath, 'utf-8');
    return htmlContent;
  } catch (error) {
    logger.warn(`Could not load business header HTML: ${error.message}`);
    return null;
  }
};

/**
 * //Intelequia - Carga el CSS personalizado del header y lo inyecta en el HTML
 * @param {string} html - Contenido HTML
 * @param {string} cssPath - Ruta relativa o por defecto './styles.css'
 * @returns {Promise<string>} - HTML con CSS inyectado
 */
const injectBusinessHeaderCSS = async (html, cssPath) => {
  try {
    const defaultCssPath = path.join(__dirname, '../../../client/public/business-header/styles.css');
    const resolvedCssPath = cssPath ? path.join(__dirname, '../../../client/public', cssPath) : defaultCssPath;

    const cssContent = await fs.readFile(resolvedCssPath, 'utf-8');

    // //Intelequia - Inyectar CSS dentro del <head> como <style>
    const styleTag = `<style>${cssContent}</style>`;
    const modifiedHtml = html.replace('</head>', `${styleTag}</head>`);

    return modifiedHtml;
  } catch (error) {
    logger.warn(`Could not load business header CSS: ${error.message}`);
    return html; // Retorna el HTML sin CSS si falla
  }
};
const emailLoginEnabled =
  process.env.ALLOW_EMAIL_LOGIN === undefined || isEnabled(process.env.ALLOW_EMAIL_LOGIN);
const passwordResetEnabled = isEnabled(process.env.ALLOW_PASSWORD_RESET);

const sharedLinksEnabled =
  process.env.ALLOW_SHARED_LINKS === undefined || isEnabled(process.env.ALLOW_SHARED_LINKS);

const publicSharedLinksEnabled =
  sharedLinksEnabled && isEnabled(process.env.ALLOW_SHARED_LINKS_PUBLIC);

const sharePointFilePickerEnabled = isEnabled(process.env.ENABLE_SHAREPOINT_FILEPICKER);
const openidReuseTokens = isEnabled(process.env.OPENID_REUSE_TOKENS);

/**
 * //Intelequia - Reemplaza variables en el HTML del header
 * @param {string} html - Contenido HTML con placeholders
 * @param {object} variables - Variables a reemplazar
 * @returns {string} - HTML con variables reemplazadas
 */
const substituteVariables = (html, variables) => {
  if (!html) return null;

  let result = html;
  Object.entries(variables).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      const placeholder = `{{${key}}}`;
      result = result.replace(new RegExp(placeholder, 'g'), value);
    }
  });
  return result;
};

router.get('/', async function (req, res) {
  const cache = getLogStores(CacheKeys.CONFIG_STORE);

  const cachedStartupConfig = await cache.get(CacheKeys.STARTUP_CONFIG);
  if (cachedStartupConfig) {
    res.send(cachedStartupConfig);
    return;
  }

  const isBirthday = () => {
    const today = new Date();
    return today.getMonth() === 1 && today.getDate() === 11;
  };

  const instanceProject = await getProjectByName(Constants.GLOBAL_PROJECT_NAME, '_id');

  const ldap = getLdapConfig();

  try {
    const appConfig = await getAppConfig({ role: req.user?.role });

    const isOpenIdEnabled =
      !!process.env.OPENID_CLIENT_ID &&
      !!process.env.OPENID_CLIENT_SECRET &&
      !!process.env.OPENID_ISSUER &&
      !!process.env.OPENID_SESSION_SECRET;

    const isSamlEnabled =
      !!process.env.SAML_ENTRY_POINT &&
      !!process.env.SAML_ISSUER &&
      !!process.env.SAML_CERT &&
      !!process.env.SAML_SESSION_SECRET;

    const balanceConfig = getBalanceConfig(appConfig);

    /** @type {TStartupConfig} */
    const payload = {
      appTitle: process.env.APP_TITLE || 'Intelewriter',
      socialLogins: appConfig?.registration?.socialLogins ?? defaultSocialLogins,
      discordLoginEnabled: !!process.env.DISCORD_CLIENT_ID && !!process.env.DISCORD_CLIENT_SECRET,
      facebookLoginEnabled:
        !!process.env.FACEBOOK_CLIENT_ID && !!process.env.FACEBOOK_CLIENT_SECRET,
      githubLoginEnabled: !!process.env.GITHUB_CLIENT_ID && !!process.env.GITHUB_CLIENT_SECRET,
      googleLoginEnabled: !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET,
      appleLoginEnabled:
        !!process.env.APPLE_CLIENT_ID &&
        !!process.env.APPLE_TEAM_ID &&
        !!process.env.APPLE_KEY_ID &&
        !!process.env.APPLE_PRIVATE_KEY_PATH,
      openidLoginEnabled: isOpenIdEnabled,
      openidLabel: process.env.OPENID_BUTTON_LABEL || 'Continue with OpenID',
      openidImageUrl: process.env.OPENID_IMAGE_URL,
      openidAutoRedirect: isEnabled(process.env.OPENID_AUTO_REDIRECT),
      samlLoginEnabled: !isOpenIdEnabled && isSamlEnabled,
      samlLabel: process.env.SAML_BUTTON_LABEL,
      samlImageUrl: process.env.SAML_IMAGE_URL,
      serverDomain: process.env.DOMAIN_SERVER || 'http://localhost:3080',
      emailLoginEnabled,
      registrationEnabled: !ldap?.enabled && isEnabled(process.env.ALLOW_REGISTRATION),
      socialLoginEnabled: isEnabled(process.env.ALLOW_SOCIAL_LOGIN),
      emailEnabled:
        (!!process.env.EMAIL_SERVICE || !!process.env.EMAIL_HOST) &&
        !!process.env.EMAIL_USERNAME &&
        !!process.env.EMAIL_PASSWORD &&
        !!process.env.EMAIL_FROM,
      passwordResetEnabled,
      showBirthdayIcon:
        isBirthday() ||
        isEnabled(process.env.SHOW_BIRTHDAY_ICON) ||
        process.env.SHOW_BIRTHDAY_ICON === '',
      helpAndFaqURL: process.env.HELP_AND_FAQ_URL || 'https://librechat.ai',
      interface: appConfig?.interfaceConfig,
      turnstile: appConfig?.turnstileConfig,
      modelSpecs: appConfig?.modelSpecs,
      balance: balanceConfig,
      sharedLinksEnabled,
      publicSharedLinksEnabled,
      analyticsGtmId: process.env.ANALYTICS_GTM_ID,
      instanceProjectId: instanceProject._id.toString(),
      bundlerURL: process.env.SANDPACK_BUNDLER_URL,
      staticBundlerURL: process.env.SANDPACK_STATIC_BUNDLER_URL,
      sharePointFilePickerEnabled,
      sharePointBaseUrl: process.env.SHAREPOINT_BASE_URL,
      sharePointPickerGraphScope: process.env.SHAREPOINT_PICKER_GRAPH_SCOPE,
      sharePointPickerSharePointScope: process.env.SHAREPOINT_PICKER_SHAREPOINT_SCOPE,
      openidReuseTokens,
      conversationImportMaxFileSize: process.env.CONVERSATION_IMPORT_MAX_FILE_SIZE_BYTES
        ? parseInt(process.env.CONVERSATION_IMPORT_MAX_FILE_SIZE_BYTES, 10)
        : 0,
    };

    const minPasswordLength = parseInt(process.env.MIN_PASSWORD_LENGTH, 10);
    if (minPasswordLength && !isNaN(minPasswordLength)) {
      payload.minPasswordLength = minPasswordLength;
    }

    const webSearchConfig = appConfig?.webSearch;
    if (
      webSearchConfig != null &&
      (webSearchConfig.searchProvider ||
        webSearchConfig.scraperProvider ||
        webSearchConfig.rerankerType)
    ) {
      payload.webSearch = {};
    }

    if (webSearchConfig?.searchProvider) {
      payload.webSearch.searchProvider = webSearchConfig.searchProvider;
    }
    if (webSearchConfig?.scraperProvider) {
      payload.webSearch.scraperProvider = webSearchConfig.scraperProvider;
    }
    if (webSearchConfig?.rerankerType) {
      payload.webSearch.rerankerType = webSearchConfig.rerankerType;
    }

    if (ldap) {
      payload.ldap = ldap;
    }

    if (typeof process.env.CUSTOM_FOOTER === 'string') {
      payload.customFooter = process.env.CUSTOM_FOOTER;
    }
    /**
     * Look and feel env settings
     * @Author Enrique Pedroza
     * @Organization Intelequia
     */
    payload.businessChatTitle = process.env.BUSINESS_CHAT_TITLE || 'Intelewriter';
    payload.businessChatTitleFont = process.env.BUSINESS_CHAT_TITLE_FONT || 'Inter, sans-serif';
    payload.businessChatTitleFontWeight = process.env.BUSINESS_CHAT_TITLE_FONT_WEIGHT || 'bold';
    payload.businessChatTitleFontSize = process.env.BUSINESS_CHAT_TITLE_FONT_SIZE || '16px';
    payload.businessChatTitleLight = process.env.BUSINESS_CHAT_TITLE_COLOR_LIGHT || "black";
    payload.businessChatTitleDark = process.env.BUSINESS_CHAT_TITLE_COLOR_DARK || "white";
    payload.businessChatLogo = process.env.BUSINESS_CHAT_LOGO || 'https://intelequia.com/Portals/0/Images/iss-logo-grey.png';
    payload.businessChatLogoDark = process.env.BUSINESS_CHAT_LOGO_DARK || 'https://intelequia.com/Portals/0/Images/iss-logo-grey.png';
    payload.businessChatBackgroundLight = process.env.BUSINESS_CHAT_BACKGROUND_LIGHT || "#f3f3f3";
    payload.businessChatBackgroundDark = process.env.BUSINESS_CHAT_BACKGROUND_DARK || "#141414";

    // //Intelequia - Cargar HTML personalizado del header si está habilitado
    const useCustomHeader = isEnabled(process.env.BUSINESS_HEADER_USE_CUSTOM_HTML);
    const headerHtmlPath = process.env.BUSINESS_HEADER_HTML_PATH;

    // //Intelequia - Always set businessHeaderEnabled to control backend behavior
    payload.businessHeaderEnabled = false;

    if (useCustomHeader) {
      const headerHTML = await loadBusinessHeaderHTML(headerHtmlPath);
      if (headerHTML) {
        // //Intelequia - Inyectar CSS dentro del HTML
        const htmlWithCSS = await injectBusinessHeaderCSS(headerHTML);

        // //Intelequia - Reemplazar variables en el HTML
        const substitutedHTML = substituteVariables(htmlWithCSS, {
          BUSINESS_CHAT_TITLE: payload.businessChatTitle,
          BUSINESS_CHAT_LOGO: payload.businessChatLogo,
          BUSINESS_CHAT_LOGO_DARK: payload.businessChatLogoDark,
        });
        if (substitutedHTML) {
          payload.businessHeaderHTML = substitutedHTML;
          payload.businessHeaderEnabled = true;
          logger.info('Custom business header HTML loaded successfully');
        }
      } else {
        logger.warn('BUSINESS_HEADER_USE_CUSTOM_HTML enabled but HTML file not found, falling back to default header');
      }
    }

    payload.balanceEnabled = process.env.CHECK_BALANCE == 'true' ? true : false
    payload.openidAutoRedirect = process.env.OPENID_AUTOREDIRECT == 'true' ? true : false;

    await cache.set(CacheKeys.STARTUP_CONFIG, payload);
    return res.status(200).send(payload);
  } catch (err) {
    logger.error('Error in startup config', err);
    return res.status(500).send({ error: err.message });
  }
});

module.exports = router;
