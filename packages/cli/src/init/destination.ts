import * as http from 'http';
import * as https from 'https';
import type { AST, EventSchema, Field } from '@syftdata/common/lib/types';
import { SyftEventType } from '@syftdata/common/lib/client_types';

/***
 * Given a syft destination, this can re-create the schema file.
 */

interface ApiFieldType {
  name: string;
  zodType: string;
  syfttype?: string;
}

interface ApiField {
  name: string;
  type: ApiFieldType;
  documentation?: string;
  defaultValue?: string;
  isOptional: boolean;
}

interface ApiEventSchema {
  eventType: string; // type of the event
  name: string;
  documentation?: string;
  fields: ApiField[];
  traits?: string[];
  destinations?: string[];
  exported?: boolean;
  zodType: string;
}

interface ApiAST {
  appName: string;
  appVersion: string;
  events: ApiEventSchema[];
}

export interface FileInfo {
  name: string;
  path: string;
  size: number;
  created?: Date;
  updated?: Date;
  updatedBy?: string;
  sha?: string;
  content?: string;
}

export interface CLIPullResponse {
  activeBranch: string; // branch that is active
  files: FileInfo[]; // tests in those branches
  eventSchemaSha?: string; // used to update the file without overwriting others changes.
  eventSchema: ApiAST; // event catalog
}

export interface CLIParsedPullData {
  activeBranch: string;
  ast: AST;
  tests: FileInfo[];
  eventSchemaSha?: string;
}

function getEventSchema(event: ApiEventSchema): EventSchema {
  const fields = event.fields.map((field) => {
    const { name, ...fieldProps } = field;
    const val: Field = {
      ...fieldProps,
      name,
      isOptional: field.isOptional,
      type: {
        name: field.type.name,
        zodType: field.type.zodType ?? 'z.any()',
        isArray: false
      }
    };
    return val;
  });

  const schema: EventSchema = {
    name: event.name,
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    documentation: event.documentation ?? '',
    fields,
    zodType: event.zodType,
    eventType: SyftEventType[event.eventType as keyof typeof SyftEventType]
  };
  return schema;
}

export async function fetchRemoteData(
  baseUrl: string,
  apikey: string,
  branch?: string
): Promise<CLIParsedPullData | undefined> {
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  const fullUrl = `${baseUrl}/api/cliinfo`;
  const payloadData = JSON.stringify({ branch });

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': payloadData.length,
      'syft-cli-auth': apikey
    }
  };
  let protocol: Pick<typeof http, 'request'> = http;
  if (baseUrl.includes('https')) {
    protocol = https;
  }
  return await new Promise((resolve, reject) => {
    const req = protocol.request(fullUrl, options, (res) => {
      if (
        res.statusCode !== undefined &&
        res.statusCode >= 200 &&
        res.statusCode <= 299
      ) {
        const body: Buffer[] = [];
        res.on('data', (d) => body.push(d));
        res.on('end', () => {
          try {
            const responseData = JSON.parse(
              Buffer.concat(body).toString()
            ) as CLIPullResponse;
            const events = responseData.eventSchema.events;
            const eventSchemas = events.map(getEventSchema);
            resolve({
              ast: {
                config: {
                  version: responseData.eventSchema.appVersion,
                  projectName: responseData.eventSchema.appName
                },
                eventSchemas,
                sinks: []
              },
              activeBranch: responseData.activeBranch,
              eventSchemaSha: responseData.eventSchemaSha,
              tests: responseData.files
            });
          } catch (e) {
            reject(e);
          }
        });
      } else {
        const body: Buffer[] = [];
        res.on('data', (d) => body.push(d));
        res.on('end', () => {
          try {
            const responseData = JSON.parse(Buffer.concat(body).toString());
            reject(new Error(responseData.message as string));
          } catch (e) {
            reject(new Error(`statusCode=${res.statusCode ?? 'undefined'}`));
          }
        });
      }
    });
    req.write(payloadData);
    req.end();
  });
}

/// / PUSH INTERFACES //////

// export interface CLIPushRequest {
//   activeBranch: string; // active branch sent down
//   files: FileInfo[]; // tests in those branches
//   eventSchemaSha?: string; // used to update the file without overwriting others changes.
//   eventSchema: EventSchemas; // event catalog
// }

// export interface CLIPushResponse {
//   files: FileInfo[]; // tests in those branches
//   eventSchemaSha?: string; // used to update the file without overwriting others changes.
// }

// export interface CLIParsedPushData {
//   tests: FileInfo[];
//   eventSchemaSha?: string;
// }

/// //// REMOTE PUSH ///////

// interface ApiCall {
//   apiKey: string;
//   appVersion?: string; // schema / api version
//   libVersion: string; // uploader / cli version
//   env: string;
//   libPlatform: string;
//   samplingRate: number;
//   events: ApiEvent[];
// }

// function getApiEvent(schema: EventSchema): ApiEvent {
//   const properties = schema.fields.map((field) => {
//     const val: ApiField = {
//       type: field.type.name,
//       name: field.name,
//       documentation: field.documentation,
//       zodType: field.type.zodType,
//       isOptional: field.isOptional,
//       defaultValue: field.defaultValue
//     };
//     return val;
//   });
//   const result: ApiEvent = {
//     name: getHumanizedEventName(schema.name), // make it human friendly
//     id: schema.name,
//     alias: schema.name,
//     documentation: schema.documentation,
//     fields: properties,
//     eventType: SyftEventType[schema.eventType]
//   };
//   return result;
// }

// export async function publishEventShemas(
//   ast: AST,
//   baseUrl: string,
//   apiKey: string,
//   appVersion: string
// ): Promise<boolean> {
//   if (process.env.NODE_ENV === 'test') {
//     return true;
//   }

//   const fullUrl = `${baseUrl}/api/catalog`;
//   const payload: ApiCall = {
//     apiKey,
//     libVersion: CLIVersion,
//     appVersion,
//     libPlatform: 'cli',
//     samplingRate: 1.0,
//     env: '',
//     events: ast.eventSchemas
//       .filter((schema) => schema.exported)
//       .map(getApiEvent)
//   };
//   const payloadData = JSON.stringify(payload);
//   logVerbose(`Making an api call to ${fullUrl}, payload: ${payloadData}`);

//   const options = {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'Content-Length': payloadData.length,
//       'syft-cli-auth': apiKey
//     }
//   };
//   let protocol: Pick<typeof http, 'request'> = http;
//   if (baseUrl.includes('https')) {
//     protocol = https;
//   }
//   return await new Promise((resolve, reject) => {
//     const req = protocol.request(fullUrl, options, (res) => {
//       if (
//         res.statusCode !== undefined &&
//         res.statusCode >= 200 &&
//         res.statusCode <= 299
//       ) {
//         resolve(true);
//       } else {
//         reject(new Error(`statusCode=${res.statusCode ?? 'undefined'}`));
//       }
//     });
//     req.write(payloadData);
//     req.end();
//   });
// }
