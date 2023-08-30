// import { type NextConfig } from 'next';
// import {
//   type NextProxyOptions,
//   type NextPublicProxyOptions,
//   getApiEndpoint,
//   getDomain
// } from './common/utils';

// type NextSyftEnv = { next_syft_proxy: 'true' } & {
//   [K in keyof Required<NextPublicProxyOptions> as `next_syft_${K}`]:
//     | string
//     | undefined;
// };

// export default function withSyftProxy(options: NextProxyOptions = {}) {
//   return (nextConfig: NextConfig): NextConfig => {
//     const nextPlausiblePublicProxyOptions: NextPublicProxyOptions = {
//       ...options,
//       trailingSlash:
//         nextConfig.trailingSlash != null
//           ? Boolean(nextConfig.trailingSlash)
//           : false,
//       basePath: nextConfig.basePath
//     };
//     const nextPlausibleEnv: NextSyftEnv = {
//       next_syft_proxy: 'true',
//       next_syft_trailingSlash:
//         nextPlausiblePublicProxyOptions.trailingSlash === true
//           ? 'true'
//           : undefined,
//       next_syft_basePath: nextPlausiblePublicProxyOptions.basePath,
//       next_syft_customDomain: nextPlausiblePublicProxyOptions.customDomain
//     };
//     return {
//       ...nextConfig,
//       env: {
//         ...nextConfig.env,
//         ...(nextPlausibleEnv as Record<string, string>)
//       },
//       rewrites: async () => {
//         const domain = getDomain(options);
//         const syftRewrites = [
//           {
//             source: getApiEndpoint({
//               ...nextPlausiblePublicProxyOptions,
//               basePath: ''
//             }),
//             destination: `${domain}/api/event`
//           }
//         ];

//         const rewrites = await nextConfig.rewrites?.();

//         if (rewrites == null) {
//           return syftRewrites;
//         } else if (Array.isArray(rewrites)) {
//           return rewrites.concat(syftRewrites);
//         } else {
//           if (rewrites.afterFiles != null) {
//             rewrites.afterFiles = rewrites.afterFiles.concat(syftRewrites);
//             return rewrites;
//           } else {
//             rewrites.afterFiles = syftRewrites;
//             return rewrites;
//           }
//         }
//       }
//     };
//   };
// }
