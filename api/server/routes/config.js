const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const {
    isEnabled,
    getBalanceConfig,
    getCloudFrontConfig,
    sanitizeModelSpecs,
} = require('@librechat/api');
const { defaultSocialLogins } = require('librechat-data-provider');
const { logger, getTenantId, SystemCapabilities } = require('@librechat/data-schemas');
const { hasCapability } = require('~/server/middleware/roles/capabilities');
const { getLdapConfig } = require('~/server/services/Config/ldap');
const { getAppConfig } = require('~/server/services/Config/app');

const router = express.Router();

const loadBusinessHeaderHTML = async (htmlPath) => {
    try {
        const defaultPath = path.join(__dirname, '../../../client/public/business-header/index.html');
        const resolvedPath = htmlPath
            ? path.join(__dirname, '../../../client/public', htmlPath)
            : defaultPath;

        return await fs.readFile(resolvedPath, 'utf-8');
    } catch (error) {
        logger.warn(`Could not load business header HTML: ${error.message}`);
        return null;
    }
};

const injectBusinessHeaderCSS = async (html, cssPath) => {
    try {
        const defaultCssPath = path.join(__dirname, '../../../client/public/business-header/styles.css');
        const resolvedCssPath = cssPath
            ? path.join(__dirname, '../../../client/public', cssPath)
            : defaultCssPath;

        const cssContent = await fs.readFile(resolvedCssPath, 'utf-8');
        const styleTag = `<style>${cssContent}</style>`;
        return html.replace('</head>', `${styleTag}</head>`);
    } catch (error) {
        logger.warn(`Could not load business header CSS: ${error.message}`);
        return html;
    }
};

const substituteVariables = (html, variables) => {
    if (!html) {
        return null;
    }

    let result = html;
    for (const [key, value] of Object.entries(variables)) {
        if (value == null) {
            continue;
        }
        result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    return result;
};

const buildWebSearchConfig = (appConfig) => {
    const ws = appConfig?.webSearch;
    if (!ws) {
        return undefined;
    }

    const { searchProvider, scraperProvider, rerankerType } = ws;
    if (!searchProvider && !scraperProvider && !rerankerType) {
        return undefined;
    }

    return {
        ...(searchProvider && { searchProvider }),
        ...(scraperProvider && { scraperProvider }),
        ...(rerankerType && { rerankerType }),
    };
};

const isBirthday = () => {
    const today = new Date();
    return today.getMonth() === 1 && today.getDate() === 11;
};

const buildSharedPayload = (ldap) => {
    const emailLoginEnabled =
        process.env.ALLOW_EMAIL_LOGIN === undefined || isEnabled(process.env.ALLOW_EMAIL_LOGIN);
    const passwordResetEnabled = isEnabled(process.env.ALLOW_PASSWORD_RESET);
    const sharedLinksEnabled =
        process.env.ALLOW_SHARED_LINKS === undefined || isEnabled(process.env.ALLOW_SHARED_LINKS);
    const publicSharedLinksEnabled =
        sharedLinksEnabled && isEnabled(process.env.ALLOW_SHARED_LINKS_PUBLIC);

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

    /** @type {Partial<TStartupConfig>} */
    const payload = {
        appTitle: process.env.APP_TITLE || 'Intelewriter',
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
        openidAutoRedirect:
            isEnabled(process.env.OPENID_AUTO_REDIRECT) || isEnabled(process.env.OPENID_AUTOREDIRECT),
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
        sharedLinksEnabled,
        publicSharedLinksEnabled,
        analyticsGtmId: process.env.ANALYTICS_GTM_ID,
        openidReuseTokens: isEnabled(process.env.OPENID_REUSE_TOKENS),
        allowAccountDeletion:
            process.env.ALLOW_ACCOUNT_DELETION === undefined ||
            isEnabled(process.env.ALLOW_ACCOUNT_DELETION),
    };

    const minPasswordLength = parseInt(process.env.MIN_PASSWORD_LENGTH, 10);
    if (minPasswordLength && !isNaN(minPasswordLength)) {
        payload.minPasswordLength = minPasswordLength;
    }

    if (ldap) {
        payload.ldap = ldap;
    }

    if (typeof process.env.CUSTOM_FOOTER === 'string') {
        payload.customFooter = process.env.CUSTOM_FOOTER;
    }

    return payload;
};

const applyBusinessHeaderConfig = async (payload) => {
    payload.businessChatTitle = process.env.BUSINESS_CHAT_TITLE || 'Intelewriter';
    payload.businessChatTitleFont = process.env.BUSINESS_CHAT_TITLE_FONT || 'Inter, sans-serif';
    payload.businessChatTitleFontWeight = process.env.BUSINESS_CHAT_TITLE_FONT_WEIGHT || 'bold';
    payload.businessChatTitleFontSize = process.env.BUSINESS_CHAT_TITLE_FONT_SIZE || '16px';
    payload.businessChatTitleLight = process.env.BUSINESS_CHAT_TITLE_COLOR_LIGHT || 'black';
    payload.businessChatTitleDark = process.env.BUSINESS_CHAT_TITLE_COLOR_DARK || 'white';
    payload.businessChatLogo =
        process.env.BUSINESS_CHAT_LOGO || 'https://intelequia.com/Portals/0/Images/iss-logo-grey.png';
    payload.businessChatLogoDark =
        process.env.BUSINESS_CHAT_LOGO_DARK ||
        'https://intelequia.com/Portals/0/Images/iss-logo-grey.png';
    payload.businessChatBackgroundLight = process.env.BUSINESS_CHAT_BACKGROUND_LIGHT || '#f3f3f3';
    payload.businessChatBackgroundDark = process.env.BUSINESS_CHAT_BACKGROUND_DARK || '#141414';
    payload.businessHeaderEnabled = false;

    const useCustomHeader = isEnabled(process.env.BUSINESS_HEADER_USE_CUSTOM_HTML);
    const headerHtmlPath = process.env.BUSINESS_HEADER_HTML_PATH;
    if (!useCustomHeader) {
        return;
    }

    const headerHTML = await loadBusinessHeaderHTML(headerHtmlPath);
    if (!headerHTML) {
        logger.warn(
            'BUSINESS_HEADER_USE_CUSTOM_HTML enabled but HTML file not found, falling back to default header',
        );
        return;
    }

    const htmlWithCSS = await injectBusinessHeaderCSS(headerHTML);
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
};

function buildCloudFrontStartupConfig() {
    const config = getCloudFrontConfig();
    if (
        config?.imageSigning !== 'cookies' ||
        !config.domain ||
        !config.cookieDomain ||
        !config.privateKey ||
        !config.keyPairId
    ) {
        return undefined;
    }

    return {
        cookieRefresh: {
            endpoint: '/api/auth/cloudfront/refresh',
            domain: config.domain,
        },
    };
}

router.get('/', async (req, res) => {
    try {
        const ldap = getLdapConfig();
        const sharedPayload = buildSharedPayload(ldap);
        const cloudFront = buildCloudFrontStartupConfig();

        if (!req.user) {
            const tenantId = getTenantId();
            const baseConfig = await getAppConfig(tenantId ? { tenantId } : { baseOnly: true });

            /** @type {Partial<TStartupConfig>} */
            const payload = {
                ...sharedPayload,
                socialLogins: baseConfig?.registration?.socialLogins ?? defaultSocialLogins,
                turnstile: baseConfig?.turnstileConfig,
                ...(cloudFront ? { cloudFront } : {}),
            };

            const interfaceConfig = baseConfig?.interfaceConfig;
            if (interfaceConfig?.privacyPolicy || interfaceConfig?.termsOfService) {
                payload.interface = {};
                if (interfaceConfig.privacyPolicy) {
                    payload.interface.privacyPolicy = interfaceConfig.privacyPolicy;
                }
                if (interfaceConfig.termsOfService) {
                    payload.interface.termsOfService = interfaceConfig.termsOfService;
                }
            }

            await applyBusinessHeaderConfig(payload);
            payload.balanceEnabled = process.env.CHECK_BALANCE === 'true';

            return res.status(200).send(payload);
        }

        const appConfig = await getAppConfig({
            role: req.user.role,
            userId: req.user.id,
            tenantId: req.user.tenantId || getTenantId(),
        });

        const balanceConfig = getBalanceConfig(appConfig);

        /** @type {TStartupConfig} */
        const payload = {
            ...sharedPayload,
            socialLogins: appConfig?.registration?.socialLogins ?? defaultSocialLogins,
            interface: appConfig?.interfaceConfig,
            turnstile: appConfig?.turnstileConfig,
            modelSpecs: sanitizeModelSpecs(appConfig?.modelSpecs),
            balance: balanceConfig,
            bundlerURL: process.env.SANDPACK_BUNDLER_URL,
            staticBundlerURL: process.env.SANDPACK_STATIC_BUNDLER_URL,
            sharePointFilePickerEnabled: isEnabled(process.env.ENABLE_SHAREPOINT_FILEPICKER),
            sharePointBaseUrl: process.env.SHAREPOINT_BASE_URL,
            sharePointPickerGraphScope: process.env.SHAREPOINT_PICKER_GRAPH_SCOPE,
            sharePointPickerSharePointScope: process.env.SHAREPOINT_PICKER_SHAREPOINT_SCOPE,
            conversationImportMaxFileSize: process.env.CONVERSATION_IMPORT_MAX_FILE_SIZE_BYTES
                ? parseInt(process.env.CONVERSATION_IMPORT_MAX_FILE_SIZE_BYTES, 10)
                : 0,
            ...(cloudFront ? { cloudFront } : {}),
        };

        const webSearch = buildWebSearchConfig(appConfig);
        if (webSearch) {
            payload.webSearch = webSearch;
        }

        if (!payload.allowAccountDeletion) {
            try {
                const userId = req.user.id ?? req.user._id?.toString();
                if (userId) {
                    const canDelete = await hasCapability(
                        { id: userId, role: req.user.role ?? '', tenantId: req.user.tenantId },
                        SystemCapabilities.ACCESS_ADMIN,
                    );
                    if (canDelete) {
                        payload.allowAccountDeletion = true;
                    }
                }
            } catch (err) {
                logger.warn(`[config] ACCESS_ADMIN capability check failed: ${err.message}`);
            }
        }

        await applyBusinessHeaderConfig(payload);
        payload.balanceEnabled = process.env.CHECK_BALANCE === 'true';

        return res.status(200).send(payload);
    } catch (err) {
        logger.error('Error in startup config', err);
        return res.status(500).send({ error: err.message });
    }
});

module.exports = router;
