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

const REFERRER_KEY = 'referrer';
const FIRST_UTM_KEY = 'first_utm';
const LAST_UTM_KEY = 'last_utm';

export function getPersistentReferrer(configStore): Referrer | undefined {
  const { search } = location;
  const params = searchParams(search);
  let referrer: Referrer | undefined;
  if (params != null) {
    const referrer = getReferrer(params);
    if (referrer != null) {
      configStore.set(REFERRER_KEY, referrer);
    }
  }
  if (referrer == null) {
    referrer = configStore.get(REFERRER_KEY);
  }
  return referrer;
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

export function getFirstPersistentCampaign(
  configStore: UniversalConfigStore
): Campaign | undefined {
  // check if first utm is set
  const firstUtm = configStore.get(FIRST_UTM_KEY) as Campaign | undefined;
  if (firstUtm != null) {
    return firstUtm;
  }
  const currentUtm = getLastPersistentCampaign(configStore);
  if (currentUtm != null) {
    // expire after 30 days.
    configStore.setWithExpiration(
      FIRST_UTM_KEY,
      currentUtm,
      CAMPAIGN_EXPIRATION_DAYS
    );
    return currentUtm;
  }
}

export function getAMP(): AMP | undefined {
  const ampId = Cookies.get('_ga');
  if (ampId != null) {
    return {
      id: ampId
    };
  }
}
