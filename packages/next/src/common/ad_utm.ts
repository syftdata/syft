import type UniversalConfigStore from './configstore';
import { type AMP, type Campaign, type Referrer } from './event_types';
import { searchParams } from './utils';
import Cookies from 'js-cookie';

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

export function getReferrer(params: URLSearchParams): Referrer | undefined {
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

export function getCampaign(params: URLSearchParams): Campaign | undefined {
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

const INITIAL_REFERRER_KEY = 'initial_referrer';
const LAST_REFERRER_KEY = 'last_referrer';
const INITIAL_UTM_KEY = 'initial_utm';
const LAST_UTM_KEY = 'last_utm';

/**
 * TODO: delete campaign after conversion.
 * @param configStore
 * @param key
 * @returns
 */
function _getPersistentReferrer(
  configStore: UniversalConfigStore,
  key: string
): Referrer | undefined {
  const { search } = location;
  const params = searchParams(search);
  let referrer: Referrer | undefined;
  if (params != null) {
    referrer = getReferrer(params);
    if (referrer != null) {
      configStore.setWithExpiration(key, referrer, CAMPAIGN_EXPIRATION_DAYS);
    }
  }
  if (referrer == null) {
    referrer = configStore.get(key) as Campaign | undefined;
  }
  return referrer;
}

export function getLastPersistentReferrer(
  configStore: UniversalConfigStore
): Referrer | undefined {
  return _getPersistentReferrer(configStore, LAST_REFERRER_KEY);
}

export function getInitialPersistentReferrer(
  configStore: UniversalConfigStore
): Referrer | undefined {
  // check if first utm is set
  const firstReferrer = configStore.get(INITIAL_REFERRER_KEY) as
    | Referrer
    | undefined;
  if (firstReferrer != null) {
    return firstReferrer;
  }
  const currentReferrer = getLastPersistentReferrer(configStore);
  if (currentReferrer != null) {
    // expire after 30 days.
    configStore.setWithExpiration(
      INITIAL_REFERRER_KEY,
      currentReferrer,
      CAMPAIGN_EXPIRATION_DAYS
    );
    return currentReferrer;
  }
}

const CAMPAIGN_EXPIRATION_DAYS = 30;
/**
 * TODO: delete campaign after conversion.
 * @param configStore
 * @param key
 * @returns
 */
function _getPersistentCampaign(
  configStore: UniversalConfigStore,
  key: string
): Campaign | undefined {
  const { search } = location;
  const params = searchParams(search);
  let campaign: Campaign | undefined;
  if (params != null) {
    campaign = getCampaign(params);
    if (campaign != null) {
      configStore.setWithExpiration(key, campaign, CAMPAIGN_EXPIRATION_DAYS);
    }
  }
  if (campaign == null) {
    campaign = configStore.get(key) as Campaign | undefined;
  }
  return campaign;
}

export function getLastPersistentCampaign(
  configStore: UniversalConfigStore
): Campaign | undefined {
  return _getPersistentCampaign(configStore, LAST_UTM_KEY);
}

export function getInitialPersistentCampaign(
  configStore: UniversalConfigStore
): Campaign | undefined {
  // check if first utm is set
  const firstUtm = configStore.get(INITIAL_UTM_KEY) as Campaign | undefined;
  if (firstUtm != null) {
    return firstUtm;
  }
  const currentUtm = getLastPersistentCampaign(configStore);
  if (currentUtm != null) {
    // expire after 30 days.
    configStore.setWithExpiration(
      INITIAL_UTM_KEY,
      currentUtm,
      CAMPAIGN_EXPIRATION_DAYS
    );
    return currentUtm;
  }
}

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
export function getClickIds(): Record<string, string> {
  const { search } = location;
  const params = searchParams(search);
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
