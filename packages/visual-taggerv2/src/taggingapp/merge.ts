import { EventTag, ReactElement } from "../types";

export function getUniqueKey(eventTag: EventTag): string {
  const reactSource = eventTag.reactSource;
  return `${reactSource.source}:${reactSource.name}:${reactSource.line}`;
}

function longestCommonSubString(arr: string[]): string {
  if (arr.length < 2) {
    arr[0];
  }
  const arr2 = [...arr].sort();
  const size = arr2.length;
  const first = arr2[0],
    last = arr2[size - 1];

  if (first == last) return first;

  let i = 0;
  while (i < size && first[i] == last[i]) {
    i = i + 1;
  }
  return `${first.substring(0, i)}.*`;
}

function mergeArrays<T>(arr?: T[], arr2?: T[]): T[] {
  if (!arr || !arr2) {
    return arr || arr2 || [];
  }
  const result = [...arr];
  arr2.forEach((e) => {
    if (!result.includes(e)) {
      result.push(e);
    }
  });
  return result;
}

/**
 * Merge the event tags into one:
 * 1. Keep only one general selector. remove nth-child that has changed in selectors if possible.
 * @param eventTags
 * @returns
 */
function mergeEventTagsIntoOne(eventTags: EventTag[]): EventTag {
  if (eventTags.length === 0) throw new Error("No event tags to merge");
  if (eventTags.length === 1) return eventTags[0]!;
  const eventTag = { ...eventTags[0]! };

  const generalSelectors = eventTags.map(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (eventTag) => eventTag.selectors.generalSelector as string
  );

  let generalSelector = generalSelectors[0]!;
  // remove nth-child
  const nthChildRegex = /:nth-child\(\d+\)/g;
  const nthChildMatches = generalSelector.match(nthChildRegex);
  if (nthChildMatches != null) {
    const match = nthChildMatches[nthChildMatches.length - 1];
    if (match != null) generalSelector = generalSelector.replace(match, "");
  }

  const hrefSelectors = eventTags
    .map(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (eventTag) => eventTag.selectors.hrefSelector
    )
    .filter((a) => a != null) as string[];

  eventTag.selectors = {
    ...eventTag.selectors,
    generalSelector,
    // hrefSelector: longestCommonSubString(hrefSelectors),
  };
  eventTag.handlerToEvents = eventTags.reduce((val, tag) => {
    Object.entries(tag.handlerToEvents).forEach(([handler, events]) => {
      val[handler] = mergeArrays(val[handler], events);
    });
    return val;
  }, {} as Record<string, string[]>);

  return eventTag;
}

/**
 * Merge by the following rules:
 * 1. If the event Source is the same, coming from the same element and same source file.
 *
 * @param eventTags
 */
export function mergeEventTags(eventTags: EventTag[]): EventTag[] {
  const mappedTags: Map<string, EventTag[]> = new Map();
  eventTags.forEach((eventTag) => {
    if (eventTag.reactSource == null) return;
    const key = getUniqueKey(eventTag);
    if (mappedTags.has(key)) {
      mappedTags.get(key)!.push(eventTag);
    } else {
      mappedTags.set(key, [eventTag]);
    }
  });
  return [...mappedTags.values()].map((tags) => mergeEventTagsIntoOne(tags));
}

export function mergeEventTags1(
  elements: ReactElement[],
  tags: EventTag[]
): EventTag[] {
  const mappedTags: Map<string, EventTag> = new Map();
  tags.forEach((tag) => {
    const key = getUniqueKey(tag);
    mappedTags.set(key, tag);
  });
  return elements.map((element) => {
    const key = getUniqueKey(element);
    if (mappedTags.has(key)) {
      return mergeEventTagsIntoOne([element, mappedTags.get(key)!]);
    }
    return element;
  });
}
