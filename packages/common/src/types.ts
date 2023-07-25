/* eslint-disable @typescript-eslint/no-empty-interface */
import { type DBEventSource, type DBFieldRelation } from './db_types';
import {
  type SyftSinkType,
  type StaticConfig,
  type SyftEventType,
  type SyftInputType
} from './client_types';
import { type Expression } from 'ts-morph';

interface BasicInfo {
  name: string;
  documentation?: string;
  rename?: string;
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
  defaultValue?: string; // eg: default values 1, "hello". makes the field optional.
  dbRelation?: DBFieldRelation;
}

export interface TypeSchema extends BasicInfo {
  typeFields?: TypeField[]; // fields if the type is a complex object. for primitives, this will be empty.
  zodType: string; // for zod validation. z.string()
  syfttype?: string; // types defined in syft system. UUID, email etc.,

  isArray: boolean; // if the type is an array.
}

export interface Field extends TypeField {}

export interface EventSchema extends Omit<TypeSchema, 'isArray'> {
  fields: Field[];

  destinations?: string[];

  eventType: SyftEventType;
  dbSourceDetails?: DBEventSource;

  exported?: boolean;
}

export type SinkConfig = Record<string, string | number | boolean>;
export interface SinkBatchOptions {
  batchSize?: number;
  intervalMillis?: number;
}
export interface SinkRetryOptions {
  retries?: number;
  factor?: number;
  minTimeout?: number;
  maxTimeout?: number;
  randomize?: boolean;
}

export interface Sink {
  id: string;
  type: SyftSinkType;
  config?: SinkConfig;
  batchConfig?: SinkBatchOptions;
  retryConfig?: SinkRetryOptions;
}

export type InputConfig = Record<string, string | number | boolean>;
export interface InputSource {
  id: string;
  type: SyftInputType;
  config?: InputConfig;
}

export interface AST {
  eventSchemas: EventSchema[];
  syftConfig?: Expression;
  config: StaticConfig;
  sinks: Sink[];
  inputs: InputSource[];
}
