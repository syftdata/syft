import { getDestinationSettings } from '../src/router/destinations/index';
import * as fs from 'fs';
import * as path from 'path';

function replaceSegment(str: string) {
  return (str ?? '').replace(/Segment/g, 'Syft').replace(/segment/g, 'syft');
}

function getJSON(obj: any) {
  const val = JSON.stringify(obj, null, 2)
    .replace(/\n/g, '<br/>')
    .replace(/{/g, '(')
    .replace(/}/g, ')');
  return val;
}

function getExampleConfig(destination: any) {
  if (destination.settings == null) return '{}';
  const configs = Object.entries(destination.settings)
    .map(([key, fields]: any) => {
      if (!fields.required) return undefined;
      return `        ${key}: ${fields.default ?? '"xxxx"'}`;
    })
    .filter((x) => x != null)
    .join(',\n');
  return `{
${configs}
    }`;
}

function getConfigTable(key: string, title: string, destination: any): string {
  if (destination.settings == null) return '';
  return `### Configuration options

| Name                 | Type           | Description     | Required | Default         |
| -------------------- | -------------- | --------------- | -------- | --------------- |
${Object.entries(destination.settings)
  .map(([key, fields]: any) => {
    return `| ${key} | ${fields.type} | ${replaceSegment(
      fields.description
    )} | ${fields.required ?? 'false'} | ${fields.default ?? ''} |`;
  })
  .join('\n')}`;
}

function getSetup(key: string, title: string, destination: any): string {
  return `## Set up
An example setup for the ${title} is shown below.

\`\`\`ts title="src/pages/api/syft.ts"
import { type NextApiRequest, type NextApiResponse } from "next";
// highlight-next-line
import { NextSyftServer } from "@syftdata/next/lib/next";

const destinations = [
  // highlight-start
  {
    type: "${key}",
    settings: ${getExampleConfig(destination)},
  },
  // highlight-end
];
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const server = new NextSyftServer({ destinations });
  await server.handlePageApi(req, res);
}
\`\`\`

${getConfigTable(key, title, destination)} 
`;
}

function getPresets(key: string, destination: any): string {
  if (destination.presets == null || destination.presets.length === 0)
    return '';
  return `## Data Modeling
${destination.presets?.map((preset: any, index) => getPreset(preset, index))}
`;
}

function getPreset(preset: any, index: number) {
  return `<details>
<summary>${preset.name ?? `Preset ${index + 1}`}</summary>

#### Matched events
${preset.subscribe}

#### Data Mapping
| Name                 | Type          | Description     | Default   |
| -------------------- | -------------- | -------------- | --------- |
${Object.entries(preset.mapping)
  .map(([key, value]: any) => {
    return `| ${key} | string | test description | ${getJSON(value)} |`;
  })
  .join('\n')}
</details>
`;
}

function getMDX(key: string, title: string, index: number, destination: any) {
  return `---
sidebar_position: ${index}
---
# ${title}

This page describes how to set up the ${title} as a destination.

${getSetup(key, title, destination)}

${getPresets(key, destination)}
`;
}
describe('destinations', () => {
  it('get configs of all registered destinations', async () => {
    const destinations = getDestinationSettings();
    Object.entries(destinations).forEach(([key, value], index) => {
      // change the first letter to uppercase
      const title = key.charAt(0).toUpperCase() + key.slice(1);
      const mdx = getMDX(key, title, index + 11, value);
      // write to file
      fs.writeFileSync(
        path.join(__dirname, `../../docs/docs/destinations/${key}.md`),
        mdx
      );
    });
  });
});
