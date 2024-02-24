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
    const target = e.target as HTMLElement;
    // get parent if target is a child of a button
    const parentTarget = target.closest('button, a');
    if (parentTarget != null) {
      callback(target.tagName, getLabelText(target), {
        id: target.id,
        class: target.getAttribute('class'),
        href: target.getAttribute('href')
      });
    }
  };

  document.addEventListener('click', handleClickEvent);
  const iframes = document.querySelectorAll('iframe');
  iframes.forEach((iframe) => {
    const doc = iframe.contentDocument;
    if (doc == null) return;
    doc.addEventListener('click', handleClickEvent);
  });

  return () => {
    document.removeEventListener('click', handleClickEvent);
    iframes.forEach((iframe) => {
      const doc = iframe.contentDocument;
      if (doc == null) return;
      doc.removeEventListener('click', handleClickEvent);
    });
  };
}
