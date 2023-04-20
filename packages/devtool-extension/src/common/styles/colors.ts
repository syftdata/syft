import { css } from "@emotion/css"

const Branding = {
  Blue: '#2545C1',
  DarkBlue: '#071B68',
  V1: '#E7EAF6',
  V3: '#C4CEF8',
  V5: '#7B94F6',
}

const Gray = {
  Background: '#FCFCFD',
  V1: '#EAEBED',
  V3: '#C9CACE',
  V5: '#83848A',
  V7: '#3E4048',
  V9: '#1C1E27',
}

const Core = {
  Red: '#EC3232',
  Green: '#00BA29',
}

const Secondary = {
  Yellow: '#F6EA7B',
  Orange: '#F6A87B',
  Purple: '#CF7BF6',
  Salmon: '#F67B7B',
  Green: '#7BF6A5',
}

const Code = {
  Green: '#DDF3DF',
  Red: '#FBD0D0',
}

const Transparent = {
  Light: {
    V1: 'rgba(255, 255, 255, 0.1)',
    V3: 'rgba(255, 255, 255, 0.3)',
    V5: 'rgba(255, 255, 255, 0.5)',
    V7: 'rgba(255, 255, 255, 0.7)',
    V9: 'rgba(255, 255, 255, 0.9)',
  },
  Dark: {
    V1: 'rgba(28, 30, 39, 0.1)',
    V3: 'rgba(28, 30, 39, 0.3)',
    V5: 'rgba(28, 30, 39, 0.5)',
    V7: 'rgba(28, 30, 39, 0.7)',
    V9: 'rgba(28, 30, 39, 0.9)',
  }
}

const Colors = {
  Branding,
  Gray,
  Core,
  Secondary,
  Code,
  Transparent,
  White: '#FFFFFF',
  Black: '#000000',
}

const Blur = {
  V1: css({
    backdropFilter: 'blur(2px)',
    WebkitBackdropFilter: 'blur(2px)',
  }),
  V2: css({
    backdropFilter: 'blur(5px)',
    WebkitBackdropFilter: 'blur(5px)',
  }),
  V3: css({
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  }),
  V4: css({
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  }),
}

export const colorCss = (color: string) => css({ color: `${color} !important`, });
export const boxShadowCss = (boxShadow: string) => css({ boxShadow, });
export const textShadowCss = (textShadow: string) => css({ textShadow, });
export const iconShadowCss = (iconShadow: string) => css({ 
  'svg': {
      filter: `drop-shadow(${iconShadow})`,
    },
  });
export const backgroundCss = (background: string) => css({
  background,
});
export const borderCss = (border: string) => css({
  border,
});

export {
  Colors,
  Blur,
}