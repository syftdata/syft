import { type Campaign, type Referrer } from './event_types';

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
