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
    target = target.closest('button, a');
    if (target == null) return;
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

  const handleCopyEvent = (e: Event): void => {
    const target = e.target as HTMLElement;
    callback("copy", document.getSelection().toString(), {
      id: target.id,
      class: target.getAttribute('class')
    });
  };

  document.addEventListener('click', handleClickEvent, { capture: true });
  document.addEventListener('copy', handleCopyEvent, { capture: true });
  const iframes = document.querySelectorAll('iframe');
  iframes.forEach((iframe) => {
    const doc = iframe.contentDocument;
    if (doc == null) return;
    doc.addEventListener('click', handleClickEvent, { capture: true });
    doc.addEventListener('copy', handleCopyEvent, { capture: true });
  });

  return () => {
    document.removeEventListener('click', handleClickEvent, { capture: true });
    document.removeEventListener('copy', handleCopyEvent, { capture: true });
    iframes.forEach((iframe) => {
      const doc = iframe.contentDocument;
      if (doc == null) return;
      doc.removeEventListener('click', handleClickEvent, { capture: true });
      doc.removeEventListener('copy', handleCopyEvent, { capture: true });
    });
  };
}
