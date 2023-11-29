import { type SyftFormData, type SyftFormField } from '../blocks/forms/types';
import { type Campaign } from '../common/event_types';
import { getCurrentPath } from '../common/utils';
function parseFormAction(
  formAction: string,
  baseUrl: string = window.location.href
): URL | undefined {
  if (formAction == null || formAction === '') return;
  try {
    const parsedURL = new URL(formAction, baseUrl);
    return parsedURL;
  } catch (error) {}
}

type FormInputField =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement;

function getLabelText(r: Element): string {
  if (!(r instanceof HTMLElement)) return;
  let t = r.innerText.trim();
  if (t.length === 0) {
    t = r.textContent.trim();
    if (t.length === 0) {
      t = r.getAttribute('aria-label');
    }
  }
  return t;
}
function getLabelTextForInput(r: FormInputField): string | undefined {
  if (r.labels?.length > 0) {
    const labels = Array.from(r.labels)
      .map((g) => getLabelText(g))
      .filter((label) => label.length > 0);
    if (labels.length > 0) {
      return labels[0];
    }
  }
}

function getFormFields(r: HTMLFormElement): SyftFormField[] {
  const fields: SyftFormField[] = [];
  const children = Array.from(r.elements);
  children.forEach((child) => {
    if (
      !(
        child instanceof HTMLInputElement ||
        child instanceof HTMLTextAreaElement ||
        child instanceof HTMLSelectElement
      )
    )
      return;
    if (
      child.value == null ||
      (child instanceof HTMLInputElement &&
        (child.type === 'checkbox' || child.type === 'radio') &&
        !child.checked)
    )
      return;

    const label = getLabelTextForInput(child);
    fields.push({
      id: child.id,
      label,
      name: child.name,
      type: child.type,
      tagName: child.tagName,
      value: child.value
    });
  });
  return fields;
}

export function formSubmits(
  callback: (path: string, data: SyftFormData, destination?: URL) => void,
  shouldTrack?: (
    path: string,
    form: HTMLFormElement,
    destination?: URL
  ) => boolean,
  campaign?: Campaign
): () => void {
  function handleSubmit(form: HTMLFormElement, destination?: URL): void {
    const currentPath = getCurrentPath(true);
    if (shouldTrack != null && !shouldTrack(currentPath, form, destination)) {
      return;
    }
    callback(
      currentPath,
      {
        attributes: { ...form.dataset },
        fields: getFormFields(form)
      },
      destination
    );
  }

  const handleSubmitEvent = (event: SubmitEvent): void => {
    const form = event.target as HTMLFormElement;
    if (form == null || !(form instanceof HTMLFormElement)) return;
    if (form.dataset.syftSubmitted === 'true') {
      delete form.dataset.syftSubmitted;
      return;
    }
    if (typeof form.requestSubmit === 'function') {
      const submitter = event.submitter;
      handleSubmit(form, parseFormAction(form.action));
      if (
        !(typeof process !== 'undefined' && process.env.NODE_ENV === 'test')
      ) {
        form.dataset.syftSubmitted = 'true';
        event.preventDefault();
        event.stopPropagation();
        setTimeout(() => {
          form.requestSubmit(submitter);
        }, 0);
      }
    }
  };

  document.addEventListener('submit', handleSubmitEvent, {
    capture: true
  });
  const iframes = document.querySelectorAll('iframe');
  iframes.forEach((iframe) => {
    const doc = iframe.contentDocument;
    if (doc == null) return;
    doc.addEventListener('submit', handleSubmitEvent, {
      capture: true
    });
  });

  // add input hidden fields to all forms.
  if (campaign != null) {
    const forms = document.querySelectorAll('form');
    forms.forEach((form) => {
      Object.entries(campaign).forEach(([name, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = `utm_${name}`;
        input.value = value;
        form.appendChild(input);
      });
    });
  }

  const originalSubmit = HTMLFormElement.prototype.submit;
  HTMLFormElement.prototype.submit = function () {
    try {
      handleSubmit(this);
    } catch (e) {}
    originalSubmit.call(this);
  };

  return () => {
    document.removeEventListener('submit', handleSubmitEvent, {
      capture: true
    });
    iframes.forEach((iframe) => {
      const doc = iframe.contentDocument;
      if (doc == null) return;
      doc.removeEventListener('submit', handleSubmitEvent, { capture: true });
    });
    HTMLFormElement.prototype.submit = originalSubmit;
  };
}
