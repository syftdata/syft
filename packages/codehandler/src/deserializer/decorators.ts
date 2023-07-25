import { JSDocTypeTag, type Decorator, type JSDoc, SyntaxKind } from 'ts-morph';
import { type TypeField } from '@syftdata/common/lib/types';
import { SyftEventType } from '@syftdata/common/lib/client_types';
import { logError } from '@syftdata/common/lib/utils';
import { extractKVPairsFromObjectLiteral, getTags } from './ts_morph_utils';
import { ZOD_ALLOWED_TAGS } from './zod_utils';
import {
  type DBEventSource,
  type DBFieldRelation
} from '@syftdata/common/lib/db_types';

export interface EventProperties {
  eventType?: SyftEventType;
  dbSourceDetails?: DBEventSource;
}

export interface FieldProperties {
  zodType?: string;
  dbRelation?: DBFieldRelation;
  rename?: string;
}

export function extractFieldProperties(
  typeField: TypeField,
  decorators: Decorator[],
  docs: JSDoc[]
): FieldProperties {
  const tags = getTags(docs);
  let fieldRelationProperties: DBFieldRelation | undefined;
  let rename: string | undefined;
  decorators.forEach((decorator) => {
    const name = decorator.getName();
    if (name === 'relation') {
      const args = decorator.getArguments();
      if (args.length === 0) {
        logError(`@relation decorator requires an argument`);
        return;
      }
      const dbArg = args[0];
      if (dbArg.isKind(SyntaxKind.ObjectLiteralExpression)) {
        const kvPairs = extractKVPairsFromObjectLiteral(dbArg);
        if (
          kvPairs.has('table') &&
          kvPairs.has('references') &&
          kvPairs.has('fields')
        ) {
          fieldRelationProperties = {
            table: kvPairs.get('table') as string,
            references: kvPairs.get('references') as string[],
            fields: kvPairs.get('fields') as string[],
            isMany: typeField.type.isArray ?? false
          };
        }
      }
      if (fieldRelationProperties === undefined) {
        logError(
          `relation decorator requires table, references, fields properties`
        );
      }
    } else if (name === 'rename') {
      const args = decorator.getArguments();
      if (args.length === 0) {
        logError(`@rename decorator requires an argument`);
        return;
      }
      const dbArg = args[0];
      if (dbArg.isKind(SyntaxKind.StringLiteral)) {
        rename = dbArg.getLiteralValue();
      }
    }
  });

  let zodType = typeField.type.zodType;
  const allowedZodTags = ZOD_ALLOWED_TAGS[typeField.name] ?? [];
  tags.forEach((tag) => {
    const name = tag.getTagName();
    if (allowedZodTags.includes(name)) {
      const paramString = tag.getCommentText()?.trim();
      if (paramString !== undefined && paramString.length > 0) {
        if (name === 'startsWith' || name === 'endsWith') {
          zodType = `${zodType}.${name}("${paramString}")`;
        } else {
          const paramInt = parseInt(paramString);
          zodType = `${zodType}.${name}(${!isNaN(paramInt) ? paramInt : ''})`;
        }
      }
    }
  });
  return {
    zodType,
    dbRelation: fieldRelationProperties,
    rename
  };
}

export function extractEventProperties(
  decorators: Decorator[],
  docs: JSDoc[]
): EventProperties {
  const tags = getTags(docs);
  let eventType: SyftEventType | undefined;
  let dbProperties: DBEventSource | undefined;

  decorators.forEach((decorator) => {
    const name = decorator.getName();
    if (name === 'eventtype') {
      const args = decorator.getArguments();
      if (args.length === 0) {
        logError(`@eventtype decorator requires arguments`);
        return;
      }
      const arg = args[0];
      const eventTypeString = arg.getText();
      if (!eventTypeString.startsWith('SyftEventType.')) {
        logError(`@eventtype decorator requires SyftEventType enum`);
        return;
      }
      eventType = SyftEventType[eventTypeString.replace('SyftEventType.', '')];
      if (eventType === SyftEventType.DB) {
        const dbArg = args[1];
        if (dbArg.isKind(SyntaxKind.ObjectLiteralExpression)) {
          const kvPairs = extractKVPairsFromObjectLiteral(dbArg);
          if (kvPairs.has('table') && kvPairs.has('on')) {
            dbProperties = {
              table: kvPairs.get('table') as string,
              on: kvPairs.get('on') as string,
              fields: kvPairs.get('fields') as string[]
            };
          }
        }
        if (dbProperties === undefined) {
          logError(
            `eventtype decorator with SyftEventType.DB requires table and on properties`
          );
        }
      }
    }
  });

  tags.forEach((tag) => {
    if (tag instanceof JSDocTypeTag || tag.getTagName() === 'type') {
      const fullTypeString = (tag as JSDocTypeTag)
        .getTypeExpression()
        ?.getTypeNode()
        ?.getText();
      if (fullTypeString === undefined) return;
      const typeString = fullTypeString.replace('SyftEventType.', '');
      if (typeString in SyftEventType) {
        eventType = SyftEventType[typeString as keyof typeof SyftEventType];
      }
    }
  });
  return { eventType, dbSourceDetails: dbProperties };
}
