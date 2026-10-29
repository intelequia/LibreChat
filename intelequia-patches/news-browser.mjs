import assert from 'node:assert/strict';
import { access, mkdir, readFile } from 'node:fs/promises';
import { homedir, tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { chromium, expect } from '@playwright/test';
import semver from 'semver';

const root = fileURLToPath(new URL('../client/', import.meta.url));
const { version } = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const catalog = JSON.parse(
    await readFile(
        new URL('../client/src/intelequia/news/content/releases.json', import.meta.url),
        'utf8',
    ),
);
const releaseCount = catalog.filter((release) => semver.lte(release.version, version)).length;
const resultsRoot = path.join(tmpdir(), 'librechat-intelequia-news-browser');
const entryId = '/__intelequia_news__/entry.js';
const authId = '\0intelequia-news-auth';
const entry = `
import 'regenerator-runtime/runtime';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { RecoilRoot } from 'recoil';
import { Provider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, ThemeContext } from '@librechat/client';
import AccountSettings from '/src/components/Nav/AccountSettings.tsx';
import Markdown from '/src/intelequia/news/Markdown.tsx';
import i18n, { i18nInitPromise } from '/src/locales/i18n.ts';
import '/src/style.css';
await i18nInitPromise;
await i18n.changeLanguage('en');
const app = createRoot(document.getElementById('root'));
const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
window.newsCheck = { i18n, markdown(content) { app.render(React.createElement(Markdown, { content })); } };
function Controls() { window.newsCheck.theme = React.useContext(ThemeContext); return null; }
app.render(React.createElement(QueryClientProvider, { client },
  React.createElement(RecoilRoot, null, React.createElement(Provider, null,
    React.createElement(ThemeProvider, { initialTheme: 'light' },
      React.createElement(Controls),
      React.createElement(MemoryRouter, null,
        React.createElement('aside', { className: 'h-screen w-64 border-r border-border-light bg-surface-primary p-3' },
          React.createElement(AccountSettings)
        )
      )
    )
  ))
));
`;

const fixture = {
    name: 'intelequia-news-browser-fixture',
    enforce: 'pre',
    resolveId(source) {
        if (source === entryId) {
            return entryId;
        }
        if (/(?:^|\/)AuthContext(?:\.tsx)?$/.test(source)) {
            return authId;
        }
    },
    load(id) {
        if (id === entryId) {
            return entry;
        }
        if (id === authId) {
            return `
import { createContext, createElement } from 'react';
const value = { user: { _id: '000000000000000000000001', name: 'Preview User', username: 'preview', email: 'preview@example.test', role: 'USER' }, isAuthenticated: true, isAuthReady: true, logout() {}, setUserContext() {} };
export const AuthContext = createContext(value);
export const AuthContextProvider = ({ children }) => createElement(AuthContext.Provider, { value }, children);
export const useAuthContext = () => value;
`;
        }
    },
    configureServer(server) {
        server.middlewares.use(async (request, response, next) => {
            if (request.url !== '/__intelequia_news__/') {
                next();
                return;
            }
            try {
                const html = await server.transformIndexHtml(
                    request.url,
                    `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><div id="root"></div><script type="module" src="${entryId}"></script></body></html>`,
                );
                response.setHeader('Content-Type', 'text/html; charset=utf-8');
                response.end(html);
            } catch (error) {
                next(error);
            }
        });
    },
};

async function main() {
    process.chdir(root);
    await mkdir(resultsRoot, { recursive: true });
    const server = await createServer({
        root,
        configFile: path.join(root, 'vite.config.ts'),
        plugins: [fixture],
        server: { host: '127.0.0.1', port: 0, strictPort: false, open: false },
        logLevel: 'error',
    });
    await server.listen();
    const nativeRoot = path.join(homedir(), '.cache/intelewriter-lists-checks/native');
    const env = { ...process.env };
    try {
        await access(nativeRoot);
        env.LD_LIBRARY_PATH = `${nativeRoot}/usr/lib/x86_64-linux-gnu:${env.LD_LIBRARY_PATH ?? ''}`;
        env.FONTCONFIG_FILE = path.join(nativeRoot, '..', 'fonts.conf');
    } catch {
        console.warn('Cached Chromium libraries were not found; using system libraries.');
    }
    let browser;
    let page;
    const errors = [];
    try {
        browser = await chromium.launch({ headless: true, env });
        page = await browser.newPage({
            viewport: { width: 1280, height: 900 },
            reducedMotion: 'reduce',
        });
        const documents = [];
        page.on('pageerror', (error) => errors.push(error.message));
        page.on('request', (request) => {
            if (request.resourceType() === 'fetch' && /\/news\/content\/.*\.md/.test(request.url())) {
                documents.push(request.url());
            }
        });
        await page.route(/\/api\/config(?:\?.*)?$/, (route) =>
            route.fulfill({
                contentType: 'application/json',
                body: JSON.stringify({ appTitle: 'LibreChat', balance: { enabled: false }, interface: {} }),
            }),
        );
        await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/__intelequia_news__/`);
        const profile = page.getByTestId('nav-user');
        await profile.click();
        await page.getByRole('menuitem', { name: "What's New", exact: true }).click();
        let dialog = page.getByRole('dialog', { name: "What's New", exact: true });
        await expect(dialog).toBeVisible();
        await expect(dialog.getByRole('heading', { name: 'Intelewriter', exact: true })).toBeVisible();
        await expect(dialog.getByRole('heading', { name: 'LibreChat', exact: true })).toHaveCount(0);
        await expect(dialog).toContainText(`Deployed version: ${version}`);
        await expect(dialog).not.toContainText('Intelewriter AdminPanel');
        await expect(dialog.getByRole('button', { name: /^v\d/ })).toHaveCount(releaseCount);
        assert.equal(documents.length, 0, 'Markdown must not load before expansion');
        const release = page
            .getByRole('dialog')
            .getByRole('button', { name: /^v0\.8\.8\s/ })
            .first();
        await release.focus();
        await page.keyboard.press('Enter');
        await expect(release).toHaveAttribute('aria-expanded', 'true');
        await expect(dialog.locator('article').first()).toContainText("What's Changed");
        await expect(dialog.locator('article').first().getByRole('heading')).toHaveCount(2);
        await expect(
            dialog.locator('article').first().getByRole('heading', { name: /Highlights$/ }),
        ).toBeVisible();
        await expect(
            dialog.getByRole('link', { name: 'Original release notes', exact: true }),
        ).toHaveCount(0);
        await expect(dialog.locator('article')).not.toContainText('New Contributors');
        await expect(
            dialog.locator(
                'article a[href*="/pull/"],article a[href*="/commit/"],article a[href*="/compare/"]',
            ),
        ).toHaveCount(0);
        await page.evaluate(() => window.newsCheck.i18n.changeLanguage('es'));
        dialog = page.getByRole('dialog', { name: 'Novedades', exact: true });
        await expect(dialog.getByRole('heading', { name: 'Intelewriter', exact: true })).toBeVisible();
        await expect(dialog.locator('article').first()).toHaveAttribute('lang', 'es');
        await expect(dialog.locator('article').first()).toContainText('Qué ha cambiado');
        await expect(dialog.locator('article').first().getByRole('heading')).toHaveCount(2);
        await expect(
            dialog.locator('article').first().getByRole('heading', { name: /Destacados$/ }),
        ).toBeVisible();
        await expect(
            dialog.locator(
                'article a[href*="/pull/"],article a[href*="/commit/"],article a[href*="/compare/"]',
            ),
        ).toHaveCount(0);
        await page.screenshot({
            path: path.join(resultsRoot, 'desktop-light.png'),
            animations: 'disabled',
        });
        await page.evaluate(() => window.newsCheck.theme.setTheme('dark'));
        await page.screenshot({
            path: path.join(resultsRoot, 'desktop-dark.png'),
            animations: 'disabled',
        });
        await page.setViewportSize({ width: 375, height: 812 });
        assert.ok(
            await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
            'Mobile page overflow',
        );
        const bounds = await dialog.boundingBox();
        assert.ok(
            bounds.x >= 0 && bounds.x + bounds.width <= 376,
            'Dialog extends outside the mobile viewport',
        );
        await page.screenshot({
            path: path.join(resultsRoot, 'mobile-dark.png'),
            animations: 'disabled',
        });
        const failedDocument = '**/v0.8.8-rc4/es.md*';
        await page.route(failedDocument, (route) => route.fulfill({ status: 503 }));
        const nextRelease = page
            .getByRole('dialog')
            .getByRole('button', { name: /^v0\.8\.8-rc4\s/ });
        await nextRelease.click();
        await expect(release).toHaveAttribute('aria-expanded', 'true');
        await expect(nextRelease).toHaveAttribute('aria-expanded', 'true');
        await expect(dialog.getByRole('alert')).toHaveText('No se han podido cargar las novedades.');
        await page.unroute(failedDocument);
        await dialog.getByRole('button', { name: /Reintentar|Retry/ }).click();
        await expect(dialog.locator('article')).toHaveCount(2);
        await expect(dialog.locator('article').nth(1)).toContainText('Qué ha cambiado');
        await page.evaluate(() => window.newsCheck.i18n.changeLanguage('fr'));
        dialog = page.getByRole('dialog', { name: "What's New", exact: true });
        await expect(dialog.locator('article').first()).toHaveAttribute('lang', 'en');
        await expect(dialog.locator('article').first()).toContainText("What's Changed");
        await expect(dialog.locator('article').nth(1)).toHaveAttribute('lang', 'en');
        await nextRelease.click();
        await expect(nextRelease).toHaveAttribute('aria-expanded', 'false');
        await expect(release).toHaveAttribute('aria-expanded', 'true');
        await expect(dialog.locator('article')).toHaveCount(1);
        const emptyRelease = dialog.getByRole('button', { name: /^v0\.8\.4-rc1\s/ });
        await emptyRelease.click();
        await expect(dialog.locator('article')).toHaveCount(2);
        await expect(dialog.locator('article').nth(1)).toHaveAttribute('lang', 'en');
        await expect(dialog.locator('article').nth(1)).toHaveText('');
        await page.evaluate(() => window.newsCheck.i18n.changeLanguage('es'));
        dialog = page.getByRole('dialog', { name: 'Novedades', exact: true });
        await expect(dialog.locator('article').nth(1)).toHaveAttribute('lang', 'es');
        await expect(dialog.locator('article').nth(1)).toHaveText('');
        await expect(dialog.getByRole('alert')).toHaveCount(0);
        await dialog.focus();
        await page.keyboard.press('Escape');
        await expect(dialog).not.toBeVisible();
        await expect(profile).toBeFocused();
        await page.evaluate(() =>
            window.newsCheck.markdown(
                '<script>window.newsXss=true</script>\n\n<img src="bad" onerror="window.newsXss=true">\n\n<a href="javascript:window.newsXss=true">Unsafe</a>\n\n<iframe srcdoc="unsafe"></iframe>',
            ),
        );
        await expect(page.locator('.markdown script,.markdown iframe,.markdown [onerror]')).toHaveCount(
            0,
        );
        assert.equal(await page.evaluate(() => window.newsXss), undefined);
        assert.equal(await page.locator('.markdown a').getAttribute('href'), null);
        assert.deepEqual(errors, [], 'Unexpected browser errors');
        console.log(
            JSON.stringify(
                {
                    result: 'PASS',
                    checks: [
                        'real LibreChat AccountSettings menu',
                        `${releaseCount} entries, no AdminPanel releases`,
                        'lazy Markdown',
                        'Spanish and English',
                        'changes and highlights only',
                        'empty notes in English and Spanish',
                        'unsupported-language fallback',
                        'error and retry',
                        'keyboard expansion',
                        'multiple releases stay open and collapse independently',
                        'Escape and focus restoration',
                        'mobile and desktop',
                        'existing light and dark themes',
                        'sanitized HTML',
                    ],
                    screenshots: resultsRoot,
                },
                null,
                2,
            ),
        );
    } catch (error) {
        if (page) {
            console.error(
                JSON.stringify(
                    { browserErrors: errors, body: (await page.locator('body').innerText()).slice(0, 2500) },
                    null,
                    2,
                ),
            );
            await page.screenshot({
                path: path.join(resultsRoot, 'failure.png'),
                animations: 'disabled',
            });
        }
        throw error;
    } finally {
        await browser?.close();
        await server.close();
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
