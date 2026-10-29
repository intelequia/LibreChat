import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  OGDialog,
  OGDialogContent,
  OGDialogHeader,
  OGDialogTitle,
} from '@librechat/client';
import type { RefObject } from 'react';
import type { NewsEntry, NewsLanguage } from './catalog';
import { deployedVersion, entries, loadContent } from './data';
import { useNewsLocalize } from './locales';
import { newsLanguage } from './catalog';
import { newsOpenAtom } from './state';
import Markdown from './Markdown';

function Content({ entry, language }: { entry: NewsEntry; language: NewsLanguage }) {
  const localize = useNewsLocalize();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['intelequia-news', entry.id, language],
    queryFn: ({ signal }) => loadContent(entry, language, signal),
    staleTime: Infinity,
    retry: false,
  });

  if (isLoading) {
    return <p role="status">{localize('com_ui_loading')}</p>;
  }
  if (isError) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <p role="alert">{localize('com_intelequia_news_error')}</p>
        <Button variant="outline" onClick={() => refetch()}>
          {localize('com_ui_retry')}
        </Button>
      </div>
    );
  }
  return (
    <article lang={language}>
      <Markdown content={data ?? ''} source={entry.source} />
    </article>
  );
}

export function NewsDialog({
  triggerRef,
}: {
  triggerRef?: RefObject<HTMLButtonElement | HTMLDivElement | null>;
}) {
  const localize = useNewsLocalize();
  const { i18n } = useTranslation();
  const [open, setOpen] = useAtom(newsOpenAtom);
  const language = newsLanguage(i18n.language);

  if (!open) {
    return null;
  }
  return (
    <OGDialog open={open} onOpenChange={setOpen} triggerRef={triggerRef}>
      <OGDialogContent className="w-11/12 max-w-3xl" aria-describedby="intelequia-news-version">
        <OGDialogHeader>
          <OGDialogTitle>{localize('com_intelequia_news_title')}</OGDialogTitle>
          <p id="intelequia-news-version" className="text-sm text-text-secondary">
            {localize('com_intelequia_news_deployed', { 0: deployedVersion })}
          </p>
        </OGDialogHeader>
        <div className="max-h-[70dvh] overflow-y-auto overscroll-contain pr-2">
          {entries.length === 0 && <p>{localize('com_intelequia_news_empty')}</p>}
          <section aria-labelledby="news-intelewriter">
            <h2 id="news-intelewriter" className="mt-2 text-base font-semibold">
              {localize('com_intelequia_news_product')}
            </h2>
            <Accordion type="multiple">
              {entries.map((entry) => (
                <AccordionItem key={entry.id} value={entry.id} className="border-border-light">
                  <AccordionTrigger>
                    <span className="flex min-w-0 flex-1 flex-col items-start gap-1 text-left">
                      <span className="flex flex-wrap items-center gap-2">
                        {`v${entry.version}`}
                        {entry.kind === 'announcement' && (
                          <span className="text-xs text-text-secondary">
                            {localize('com_intelequia_news_breaking')}
                          </span>
                        )}
                      </span>
                      <time
                        dateTime={entry.date}
                        className="text-xs font-normal text-text-secondary"
                      >
                        {new Intl.DateTimeFormat(language, {
                          dateStyle: 'long',
                          timeZone: 'UTC',
                        }).format(new Date(`${entry.date}T00:00:00Z`))}
                      </time>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Content entry={entry} language={language} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        </div>
      </OGDialogContent>
    </OGDialog>
  );
}
