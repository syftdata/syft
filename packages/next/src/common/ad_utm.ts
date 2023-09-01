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
    if (key in params) {
      referrer = {
        id: params[key],
        type: QUERYIDS[key],
        [key]: params[key]
      };
      return true;
    }
    return false;
  });
  return referrer;
}

export function getCampaign(params: URLSearchParams): Campaign | undefined {
  const results = {};
  Object.keys(params).forEach((key) => {
    if (key.substring(0, 4) === 'utm_') {
      let param = key.substring(4);
      if (param === 'campaign') param = 'name';
      results[param] = params[key];
    }
  });
  if (Object.keys(results).length === 0) return undefined;
  return results;
}
