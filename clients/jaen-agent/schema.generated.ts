/**
 * GQty AUTO-GENERATED CODE: PLEASE DO NOT MODIFY MANUALLY
 */

import { type ScalarsEnumsHash } from "gqty";

export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  Any: { input: any; output: any };
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar.This scalar is serialized to a string in ISO 8601 format and parsed from a string in ISO 8601 format. */
  DateTimeISO: { input: any; output: any };
  File: { input: any; output: any };
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: any; output: any };
  /** The `JSONObject` scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSONObject: { input: any; output: any };
  /** Custom scalar that handles both integers and floats */
  Number: { input: number; output: number };
  /** Represents NULL values */
  Void: { input: any; output: any };
}

/** Configuration options for publishing a migration to Jaen. */
export interface PublishConfigInput {
  repository: Scalars["String"]["input"];
  repositoryCwd?: InputMaybe<Scalars["String"]["input"]>;
}

export const scalarsEnumsHash: ScalarsEnumsHash = {
  Any: true,
  Boolean: true,
  DateTimeISO: true,
  File: true,
  JSON: true,
  JSONObject: true,
  Number: true,
  String: true,
  Void: true,
};
export const generatedSchema = {
  PublishConfigInput: {
    repository: { __type: "String!" },
    repositoryCwd: { __type: "String" },
  },
  PublishEvent: {
    __typename: { __type: "String!" },
    publishedDate: { __type: "DateTimeISO!" },
    repositoryPath: { __type: "String!" },
  },
  mutation: {
    __typename: { __type: "String!" },
    publish: {
      __type: "PublishEvent!",
      __args: { config: "PublishConfigInput!", migrationURL: "String!" },
    },
  },
  query: { __typename: { __type: "String!" }, version: { __type: "String!" } },
  subscription: {},
} as const;

/**
 * Represents a published Jaen migration.
 */
export interface PublishEvent {
  __typename?: "PublishEvent";
  /**
   * The date when the migration was published.
   */
  publishedDate: ScalarsEnums["DateTimeISO"];
  /**
   * The path of the Jaen repository where the migration was published.
   */
  repositoryPath: ScalarsEnums["String"];
}

export interface Mutation {
  __typename?: "Mutation";
  publish: (args: {
    /**
     * - The publish configuration.
     * @param config - The publish configuration.
     */
    config: PublishConfigInput;
    /**
     * - The URL of the migration to publish.
     * @param migrationURL - The URL of the migration to publish.
     */
    migrationURL: ScalarsEnums["String"];
  }) => PublishEvent;
}

export interface Query {
  __typename?: "Query";
  version: ScalarsEnums["String"];
}

export interface Subscription {
  __typename?: "Subscription";
}

export interface GeneratedSchema {
  query: Query;
  mutation: Mutation;
  subscription: Subscription;
}

export type ScalarsEnums = {
  [Key in keyof Scalars]: Scalars[Key] extends { output: unknown }
    ? Scalars[Key]["output"]
    : never;
} & {};
