import Syft, {{ IMPORT }} from '@syftdata/client'
export const syft = new Syft({
  appVersion: '1.0.0',
  plugins: [{ INSTANTIATION }]
});
export default syft;
