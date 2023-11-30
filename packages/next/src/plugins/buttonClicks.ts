import { getLabelText } from './formSubmit';

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
    if (
      target.tagName === 'BUTTON' ||
      target.tagName === 'A' ||
      target.tagName === 'SPAN'
    ) {
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
