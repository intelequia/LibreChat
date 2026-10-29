import { useSetAtom } from 'jotai';
import { Newspaper } from 'lucide-react';
import * as Menu from '@ariakit/react/menu';
import { useNewsLocalize } from './locales';
import { newsOpenAtom } from './state';

export function NewsMenuItem() {
  const localize = useNewsLocalize();
  const setOpen = useSetAtom(newsOpenAtom);
  return (
    <Menu.MenuItem onClick={() => setOpen(true)} className="select-item text-sm">
      <Newspaper className="icon-md" aria-hidden="true" />
      {localize('com_intelequia_news_title')}
    </Menu.MenuItem>
  );
}
