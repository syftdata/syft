/* eslint-disable @typescript-eslint/no-empty-interface */
import { type DBEventSource, type DBFieldRelation } from './db_types';
import { type StaticConfig, type SyftEventType } from './client_types';
import { type Expression } from 'ts-morph';

interface BasicInfo {
  name: string;
  documentation?: string;
}

/**
 * All supported types.
 * string
 * number
 * boolean
 * int
 * float
 * Object
 * Array
 * int
 * CUID
 * CUID2
 * UUID
 * Email
 * Url
 * CountryCode
 * Date
 * Array
 * Object
 */

export interface CUID2 {}
export interface CUID {}
export interface UUID {}
export interface Email {}
export interface Url {}
export interface CountryCode {}

export interface TypeField extends BasicInfo {
  type: TypeSchema;
  isOptional: boolean;
}

export interface TypeSchema extends BasicInfo {
  typeFields?: TypeField[]; // fields if the type is a complex object. for primitives, this will be empty.
  zodType: string; // for zod validation. z.string()
  syfttype?: string; // types defined in syft system. UUID, email etc.,
}

export interface Field extends TypeField {
  defaultValue?: string; // eg: default values 1, "hello". makes the field optional.
  relation?: DBFieldRelation;
}

export interface EventSchema extends TypeSchema {
  fields: Field[];

  destinations?: string[];

  eventType: SyftEventType;
  cdcSourceDetails?: DBEventSource;

  exported?: boolean;
}

export interface AST {
  eventSchemas: EventSchema[];
  syftConfig?: Expression;
  config: StaticConfig;
}
