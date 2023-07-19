import { type AST, type EventSchema } from '@syftdata/common/lib/types';
import * as extraSchemas from './dbt_extra_schema';
import { type ProviderConfig } from '../../config/sink_configs';
import { SyftEventType } from '@syftdata/common/lib/client_types';

function addSegmentColumns(ast: AST): void {
  ast.eventSchemas.forEach((schema) => {
    extraSchemas.BQ_SEGMENT_SCHEMA.forEach((obj) =>
      schema.fields.push({
        name: obj.name,
        type: { name: obj.type, zodType: 'z.string()', isArray: false },
        documentation: obj.description,
        isOptional: false
      })
    );
  });
}

function addSyftColumns(ast: AST): void {
  ast.eventSchemas.forEach((schema) => {
    const existingFields = schema.fields.map((field) => field.name);
    extraSchemas.BQ_SYFT_SCHEMA.forEach((obj) => {
      if (existingFields.includes(obj.name)) return;
      schema.fields.push({
        name: obj.name,
        type: { name: obj.type, zodType: 'z.string()', isArray: false },
        documentation: obj.description,
        isOptional: false
      });
    });
  });
}

function addHeapColumns(ast: AST, platform: string): void {
  // add extra schema per event
  ast.eventSchemas.forEach((schema) => {
    extraSchemas.BQ_HEAP_EVENT_SCHEMA_ALL.forEach((obj) =>
      schema.fields.push({
        name: obj.name,
        type: { name: obj.type, zodType: 'z.string()', isArray: false },
        documentation: obj.description,
        isOptional: false
      })
    );

    let extraSchema;
    if (platform === 'Web') {
      extraSchema = extraSchemas.BQ_HEAP_EVENT_SCHEMA_WEB;
    } else if (platform === 'iOS') {
      extraSchema = extraSchemas.BQ_HEAP_EVENT_SCHEMA_IOS;
    } else if (platform === 'Android') {
      extraSchema = extraSchemas.BQ_HEAP_EVENT_SCHEMA_ANDROID;
    } else {
      throw new Error(
        'Platform needs to be specified for HeapIO: [Web, iOS, Android]'
      );
    }
    extraSchema.forEach((obj) =>
      schema.fields.push({
        name: obj.name,
        type: { name: obj.type, zodType: 'z.string()', isArray: false },
        documentation: obj.description,
        isOptional: false
      })
    );
  });

  // creating new event schema to cover the default user, sessions, and pageview tables.
  // https://help.heap.io/heap-connect/heap-connect-guide/data-schema/#schema
  const users: EventSchema = {
    name: 'users',
    zodType: 'z.object({})',
    fields: [],
    eventType: SyftEventType.IDENTIFY // HACK
  };
  extraSchemas.BQ_HEAP_USERS_SCHEMA.forEach((obj) =>
    users.fields.push({
      name: obj.name,
      type: { name: obj.type, zodType: 'z.string()', isArray: false },
      documentation: obj.description,
      isOptional: false
    })
  );

  const sessions: EventSchema = {
    name: 'sessions',
    zodType: 'z.object({})',
    fields: [],
    eventType: SyftEventType.TRACK // HACK
  };
  extraSchemas.BQ_HEAP_SESSIONS_SCHEMA_ALL.forEach((obj) =>
    sessions.fields.push({
      name: obj.name,
      type: {
        name: obj.type,
        zodType: 'z.string()',
        isArray: false
      },
      documentation: obj.description,
      isOptional: false
    })
  );

  let extraSchema;
  if (platform === 'Web') {
    extraSchema = extraSchemas.BQ_HEAP_SESSIONS_SCHEMA_WEB;
  } else if (platform === 'iOS') {
    extraSchema = extraSchemas.BQ_HEAP_SESSIONS_SCHEMA_IOS;
  } else if (platform === 'Android') {
    extraSchema = extraSchemas.BQ_HEAP_SESSIONS_SCHEMA_ANDROID;
  } else {
    throw new Error(
      'Platform needs to be specified for HeapIO: [Web, iOS, Android]'
    );
  }
  extraSchema.forEach((obj) =>
    sessions.fields.push({
      name: obj.name,
      type: {
        name: obj.type,
        zodType: 'z.string()',
        isArray: false
      },
      documentation: obj.description,
      isOptional: false
    })
  );

  const pageviews: EventSchema = {
    name: 'pageviews',
    zodType: 'z.object({})',
    fields: [],
    eventType: SyftEventType.PAGE // HACK
  };

  extraSchemas.BQ_HEAP_PAGEVIEWS_SCHEMA_ALL.forEach((obj) =>
    pageviews.fields.push({
      name: obj.name,
      type: {
        name: obj.type,
        zodType: 'z.string()',
        isArray: false
      },
      documentation: obj.description,
      isOptional: false
    })
  );

  if (platform === 'Web') {
    extraSchema = extraSchemas.BQ_HEAP_PAGEVIEWS_SCHEMA_WEB;
  } else if (platform === 'iOS') {
    extraSchema = extraSchemas.BQ_HEAP_PAGEVIEWS_SCHEMA_IOS;
  } else if (platform === 'Android') {
    extraSchema = extraSchemas.BQ_HEAP_PAGEVIEWS_SCHEMA_ANDROID;
  } else {
    throw new Error(
      'Platform needs to be specified for HeapIO: [Web, iOS, Android]'
    );
  }
  extraSchema.forEach((obj) =>
    pageviews.fields.push({
      name: obj.name,
      type: {
        name: obj.type,
        zodType: 'z.string()',
        isArray: false
      },
      documentation: obj.description,
      isOptional: false
    })
  );

  ast.eventSchemas.push(users, sessions, pageviews);
}

export function addExtraColumns(
  ast: AST,
  providerConfig: ProviderConfig
): void {
  if (providerConfig.sdkType === 'segment') {
    addSegmentColumns(ast);
  } else if (providerConfig.sdkType === 'heap') {
    addHeapColumns(ast, providerConfig.platform as string);
  } else {
    addSyftColumns(ast);
  }
}
