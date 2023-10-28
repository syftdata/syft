import type UniversalConfigStore from './configstore';
import {
  type SourceTouch,
  type AMP,
  type Campaign,
  type Referrer
} from './event_types';
import { searchParams } from './utils';
import Cookies from 'js-cookie';

export function getReferrerFromParams(
  params: URLSearchParams
): Referrer | undefined {
  let referrer: Referrer | undefined;
  Object.keys(QUERYIDS).find((key) => {
    if (params.has(key)) {
      referrer = {
        id: params.get(key) ?? undefined,
        type: QUERYIDS[key],
        [key]: params.get(key)
      };
      return true;
    }
    return false;
  });
  return referrer;
}

export function getCampaignFromParams(
  params: URLSearchParams
): Campaign | undefined {
  const results = {};

  for (const key of params.keys()) {
    if (key.substring(0, 4) === 'utm_') {
      let param = key.substring(4);
      if (param === 'campaign') param = 'name';
      results[param] = params.get(key);
    }
  }
  if (Object.keys(results).length === 0) return undefined;
  return results;
}

export function getClickIdsFromParams(
  params: URLSearchParams
): Record<string, string> {
  const clickIds = {};
  if (params != null) {
    for (const key of params.keys()) {
      if (KNOWN_CLICKIDS.includes(key)) {
        clickIds[key] = params.get(key);
      }
    }
  }
  return clickIds;
}

export function getAMP(): AMP | undefined {
  const ampId = Cookies.get('_ga');
  if (ampId != null) {
    return {
      id: ampId
    };
  }
}

export function getSourceTouch(): SourceTouch {
  const { search } = location;
  const params = searchParams(search);
  const referrer = getReferrerFromParams(params);
  const campaign = getCampaignFromParams(params);
  const clickIds = getClickIdsFromParams(params);
  return {
    referrer,
    campaign,
    clickIds
  };
}

const SOURCE_EXPIRATION_DAYS = 1;
const SOURCE_TOUCH_KEY = 'source_touch';
export function getSessionSourceTouch(
  configStore: UniversalConfigStore
): SourceTouch | undefined {
  let sourceTouch = configStore.get(SOURCE_TOUCH_KEY) as
    | SourceTouch
    | undefined;
  if (sourceTouch != null) {
    return sourceTouch;
  }
  sourceTouch = getSourceTouch();
  configStore.setWithExpiration(
    SOURCE_TOUCH_KEY,
    sourceTouch,
    SOURCE_EXPIRATION_DAYS
  );
  return sourceTouch;
}

const INITIAL_SOURCE_EXPIRATION_DAYS = 30;
const INITIAL_SOURCE_TOUCH_KEY = 'initial_source_touch';
export function getInitialSourceTouch(
  configStore: UniversalConfigStore
): SourceTouch | undefined {
  let sourceTouch = configStore.get(INITIAL_SOURCE_TOUCH_KEY) as
    | SourceTouch
    | undefined;
  if (sourceTouch != null) {
    return sourceTouch;
  }
  sourceTouch = getSourceTouch();
  configStore.setWithExpiration(
    INITIAL_SOURCE_TOUCH_KEY,
    sourceTouch,
    INITIAL_SOURCE_EXPIRATION_DAYS
  );
  return sourceTouch;
}

/**
 * Get all ads info from the given `querystring`
 * Inspired from https://github.com/segmentio/ad-params/blob/master/lib/index.js
 * @param {string} query
 * @return {Object}
 */
const QUERYIDS = {
  btid: 'dataxu',
  urid: 'millennial-media'
};

// https://docs.mixpanel.com/docs/tracking/reference/javascript#tracking-utm-parameters
const KNOWN_CLICKIDS = [
  'dclid',
  'fbclid',
  'gclid',
  'ko_click_id',
  'li_fat_id',
  'msclkid',
  'ttclid',
  'twclid',
  'wbraid'
];
