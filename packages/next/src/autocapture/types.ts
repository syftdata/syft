import type { EventSchema } from '@syftdata/common/lib/types';

export interface ReactSource {
  name: string;
  source: string;
  line: number;
  props: Record<string, unknown>;

  handlers: string[];
}

interface ReactElement {
  reactSource: ReactSource;
  reactPath: string;
}

export interface EventTag extends ReactElement {
  useReactPath?: boolean;
  selector: string;

  // we need to maintain a mapping between handlernames and events.
  handlerToEvents: Record<string, string[]>;
  committed?: boolean;
  instrumented?: boolean;
}

export type AutocaptureCompatibleElement =
  | 'a'
  | 'button'
  | 'form'
  | 'input'
  | 'select'
  | 'textarea'
  | 'label'
  | 'div';
export type DomAutocaptureEvents =
  | 'click'
  | 'change'
  | 'submit'
  | 'hover'
  | 'focus'
  | 'blur';

/**
 * If an array is passed for an allowlist, autocapture events will only be sent for elements matching
 * at least one of the elements in the array. Multiple allowlists can be used
 */
export interface AutocaptureConfig {
  /**
   * List of URLs to allow autocapture on, can be strings to match
   * or regexes e.g. ['https://example.com', 'test.com/.*']
   */
  url_allowlist?: Array<string | RegExp>;

  /**
   * List of DOM events to allow autocapture on  e.g. ['click', 'change', 'submit']
   */
  dom_event_allowlist?: DomAutocaptureEvents[];

  /**
   * List of DOM elements to allow autocapture on
   * e.g. ['a', 'button', 'form', 'input', 'select', 'textarea', 'label']
   */
  element_allowlist?: AutocaptureCompatibleElement[];

  /**
   * List of CSS selectors to allow autocapture on
   * e.g. ['[syft-capture]']
   */
  css_selector_allowlist?: string[];

  schemas: EventSchema[];
  tags: EventTag[];

  toolbarJS?: string;
}

export type SyftEventHandler = (
  name: string,
  props: Record<string, unknown>,
  schema: EventSchema,
  tag: EventTag,
  ele: Element
) => void;
