import * as http from 'http';
import * as https from 'https';
import type { AST, EventSchema, Field } from '../codegen/types';
import { SyftEventType } from '../client_types';
import { CLIVersion } from '../config/pkg';
import { logVerbose } from '../utils';

/***
 * Given a syft destination, this can re-create the schema file.
 */

interface ApiField {
  name: string;
  alias?: string;
  type: string;
  documentation?: string;
  defaultValue?: string;
  isOptional: boolean;
  zodType?: string;
}

interface ApiEvent {
  eventType: string; // type of the event
  name: string;
  alias?: string;
  documentation?: string;
  fields: ApiField[];
}

interface ApiCall {
  apiKey: string;
  appVersion?: string; // schema / api version
  libVersion: string; // uploader / cli version
  env: string;
  libPlatform: string;
  samplingRate: number;
  events: ApiEvent[];
}

interface ApiResponse {
  appName: string;
  appVersion: string;
  events: ApiEvent[];
}

function getEventSchema(event: ApiEvent): EventSchema {
  const fields = event.fields.map((field) => {
    const { name, alias, ...fieldProps } = field;
    const val: Field = {
      ...fieldProps,
      name: alias ?? name,
      isOptional: field.isOptional,
      type: {
        name: field.type,
        zodType: field.zodType ?? 'z.any()'
      }
    };
    return val;
  });

  const schema: EventSchema = {
    name: event.alias ?? event.name,
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    documentation:
      event.documentation ??
      `Auto generated schema by syft-cli for ${event.name}`,
    fields,
    zodType: '',
    traits: [],
    eventType: SyftEventType[event.eventType as keyof typeof SyftEventType]
  };
  return schema;
}

function getApiEvent(schema: EventSchema): ApiEvent {
  const properties = schema.fields.map((field) => {
    const val: ApiField = {
      type: field.type.name,
      name: field.name,
      documentation: field.documentation,
      zodType: field.type.zodType,
      isOptional: field.isOptional,
      defaultValue: field.defaultValue
    };
    return val;
  });
  const result: ApiEvent = {
    name: schema.name,
    documentation: schema.documentation,
    fields: properties,
    eventType: schema.eventType.toString()
  };
  return result;
}

export async function getRemoteEventShemas(
  baseUrl: string,
  apikey: string
): Promise<AST> {
  const fullUrl = `${baseUrl}/api/get_catalog`;
  const payloadData = JSON.stringify({ apikey });

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': payloadData.length
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
            ) as ApiResponse;
            const events = responseData.events;
            const eventSchemas = events.map(getEventSchema);
            resolve({
              config: {
                version: responseData.appVersion,
                projectName: responseData.appName
              },
              eventSchemas
            });
          } catch (e) {
            reject(e);
          }
        });
      } else {
        reject(new Error(`statusCode=${res.statusCode ?? 'undefined'}`));
      }
    });
    req.write(payloadData);
    req.end();
  });
}

export async function publishEventShemas(
  ast: AST,
  baseUrl: string,
  apiKey: string,
  appVersion: string
): Promise<boolean> {
  if (process.env.NODE_ENV === 'test') {
    return true;
  }

  const fullUrl = `${baseUrl}/api/catalog`;
  const payload: ApiCall = {
    apiKey,
    libVersion: CLIVersion,
    appVersion,
    libPlatform: 'cli',
    samplingRate: 1.0,
    env: '',
    events: ast.eventSchemas
      .filter((schema) => schema.exported)
      .map(getApiEvent)
  };
  const payloadData = JSON.stringify(payload);
  logVerbose(`Making an api call to ${fullUrl}, payload: ${payloadData}`);

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': payloadData.length
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
        resolve(true);
      } else {
        reject(new Error(`statusCode=${res.statusCode ?? 'undefined'}`));
      }
    });
    req.write(payloadData);
    req.end();
  });
}
