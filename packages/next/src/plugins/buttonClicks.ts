import { getLabelText } from './autotrack/utils';

export function buttonClicks(
  callback: (
    type: string,
    text: string,
    selectors: Record<string, string>
  ) => void
): () => void {
  const handleClickEvent = (e: MouseEvent): void => {
    if (e.type !== 'click') return;
    let target = e.target as HTMLElement;
    // get parent if target is a child of a button
    if (
      window.location.hostname.includes('pomerium') ||
      window.location.hostname.includes('syftdata')
    ) {
      target = target.closest('button, a');
      if (target == null) return;
    }
    const href = target.getAttribute('href');
    const isButton =
      target.tagName === 'BUTTON' ||
      target.tagName === 'SPAN' ||
      (target.tagName === 'A' && (href == null || href === '#'));
    if (isButton) {
      callback(target.tagName, getLabelText(target), {
        id: target.id,
        class: target.getAttribute('class'),
        href
      });
    }
  };

  document.addEventListener('click', handleClickEvent, { capture: true });
  const iframes = document.querySelectorAll('iframe');
  iframes.forEach((iframe) => {
    const doc = iframe.contentDocument;
    if (doc == null) return;
    doc.addEventListener('click', handleClickEvent, { capture: true });
  });

  return () => {
    document.removeEventListener('click', handleClickEvent, { capture: true });
    iframes.forEach((iframe) => {
      const doc = iframe.contentDocument;
      if (doc == null) return;
      doc.removeEventListener('click', handleClickEvent, { capture: true });
    });
  };
}
