import { Preset } from '@segment/actions-core/destination-kitindex';
import {
  MyDestinationDefinition,
  getDestinationDefs
} from '../src/router/destinations/index';
import * as fs from 'fs';
import * as path from 'path';

function replaceSegment(str: string) {
  return (str ?? '').replace(/Segment/g, 'Syft').replace(/segment/g, 'syft');
}

function getDestinationTitle(key: string, destination: any) {
  if (key === 'ga4') return 'Google Analytics 4';
  return key.charAt(0).toUpperCase() + key.slice(1);
}

function getFieldValue(obj: any) {
  if (typeof obj === 'object') {
    if (obj['@path'] != null) {
      return obj['@path'];
    }
    if (obj['@template'] != null) {
      return `"${obj['@template'].replace(/{{(.*)}}/g, '$$.$1')}"`;
    }

    if (obj['@if'] != null) {
      return `${getFieldValue(obj['@if']['then'])} ?? ${getFieldValue(
        obj['@if']['else']
      )}`;
    }
    const jsonVal = JSON.stringify(obj, null, 2)
      .replace(/\n/g, '<br/>')
      .replace(/{/g, '{')
      .replace(/}/g, '}');
    return `<pre>${jsonVal}</pre>`;
  } else if (typeof obj === 'string') {
    return `"${obj}"`;
  }
  return obj;
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
An example setup for ${title} is shown below.

\`\`\`ts title="src/pages/api/syft.ts"
// ...
const destinations = [
  // highlight-start
  {
    type: "${key}",
    settings: ${getExampleConfig(destination)},
  },
  // highlight-end
];
// ...
\`\`\`

${getConfigTable(key, title, destination)} 
`;
}

function getPresets(key: string, destination: MyDestinationDefinition): string {
  if (destination.presets == null || destination.presets.length === 0)
    return '';
  return `## Data Modeling
${destination.presets?.map((preset) => getPreset(preset, destination))}
`;
}

function getPreset(preset: Preset, destination: MyDestinationDefinition) {
  // get action based on the preset/
  const action = Object.entries(destination.actions ?? {}).find(
    (a: any) => a[0] === preset.partnerAction
  );
  if (action == null) return '';
  if (preset.type !== 'automatic') return '';
  const actionDetails = action[1] as any;

  return `<details>
<summary>${preset.name ?? actionDetails.title}</summary>

#### ${actionDetails.title}
${actionDetails.description}

#### Matched events
${preset.subscribe}

#### Data Mapping
| Destination Field                 | Type          | Description     | Source Field   |
| -------------------- | -------------- | -------------- | --------- |
${Object.entries(preset.mapping ?? {})
  .map(([key, value]: any) => {
    const field = actionDetails.fields[key] ?? {
      type: 'string',
      description: 'N/A'
    };
    return `| ${key} | ${field.type} | ${replaceSegment(
      field.description
    )} | ${getFieldValue(value)} |`;
  })
  .join('\n')}
</details>
`;
}

function getMDX(
  key: string,
  title: string,
  index: number,
  destination: MyDestinationDefinition
) {
  return `---
sidebar_position: ${index}
---
# ${title}

This page describes how to set up ${title} as a destination.

${getSetup(key, title, destination)}

${getPresets(key, destination)}
`;
}

describe('destinations', () => {
  it('get configs of all registered destinations', async () => {
    const destinations = getDestinationDefs();
    // sorted list.
    Object.entries(destinations)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([key, value], index) => {
        // change the first letter to uppercase
        const title = getDestinationTitle(key, value);
        const mdx = getMDX(key, title, index + 11, value);
        // write to file
        fs.writeFileSync(
          path.join(
            __dirname,
            `../../docs/docs/destinations/${value.type}/${key}.md`
          ),
          mdx
        );
      });
  });
});
