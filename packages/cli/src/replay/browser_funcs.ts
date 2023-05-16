/* eslint-disable */
// @ts-nocheck

declare global {
  interface Window {
    syft: any;
  }
}

export const getSyftTester = () => {
  if (typeof window.syft !== 'undefined') {
    window.syft.getTester();
  }
  return true;
};

export const getSyftEvents = () => {
  if (typeof window.syft !== 'undefined') {
    return window.syft.getTester().events;
  }
  return [];
};
