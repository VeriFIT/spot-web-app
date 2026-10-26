import type {
  CompareResponse,
  RandomResponse,
  RewriteResponse,
  StudyResponse,
  TranslateResponse,
  VersionInfo,
  VersionsResponse,
} from "./types";

/**
 * Thrown when an endpoint answers with a document the panel cannot read.
 *
 * The server is a separate program: a renamed key or a `note` that became a
 * string would otherwise surface as a crash inside a component, where it is
 * hard to tell from a bug in the UI. Checking the declared fields here turns
 * that into one sentence naming the endpoint and the field.
 */
export class InvalidResponse extends Error {
  constructor(url: string, problem: string) {
    super(`Unexpected answer from ${url}: ${problem}`);
    this.name = "InvalidResponse";
  }
}

/** One field check, with the wording used when it fails. */
interface Check {
  test: (value: unknown) => boolean;
  expected: string;
}

/** The checks of one response, by field name. */
type Fields = Record<string, Check>;

const isString = (value: unknown): value is string => typeof value === "string";
const isBoolean = (value: unknown): value is boolean => typeof value === "boolean";
const isNumber = (value: unknown): value is number => typeof value === "number";

const STRING: Check = { test: isString, expected: "a string" };
const BOOLEAN: Check = { test: isBoolean, expected: "a boolean" };
const NUMBER: Check = { test: isNumber, expected: "a number" };

const STRING_ARRAY: Check = {
  test: (value) => Array.isArray(value) && value.every(isString),
  expected: "a list of strings",
};

const NULLABLE_STRING: Check = {
  test: (value) => value === null || isString(value),
  expected: "a string or null",
};

const NUMBER_OR_STRING_OR_NULL: Check = {
  test: (value) => value === null || isNumber(value) || isString(value),
  expected: "a number, a string or null",
};

/** A flag that is `true`/`false`, or one of the words the server uses instead. */
function flagOr(words: string[]): Check {
  return {
    test: (value) => isBoolean(value) || (isString(value) && words.includes(value)),
    expected: `a boolean or one of ${words.map((word) => `"${word}"`).join(", ")}`,
  };
}

/** A field restricted to an enumeration of the values `spotapi.py` sends. */
function oneOf(values: string[]): Check {
  return {
    test: (value) => isString(value) && values.includes(value),
    expected: `one of ${values.map((value) => `"${value}"`).join(", ")}`,
  };
}

/** Keys present in every response when the formula could not be parsed. */
const PARSE_INFO: Fields = {
  parse_error: STRING,
  prefix_syntax: BOOLEAN,
};

const REWRITE: Fields = {
  ...PARSE_INFO,
  formula: STRING,
  svg: STRING,
  error: STRING,
};

const STUDY: Fields = {
  ...PARSE_INFO,
  mp_class: STRING,
  mp_class_text: STRING,
  mp_hierarchy_svg: STRING,
  sfh_class: STRING,
  sfh_class_text: STRING,
  pathological: flagOr(["sfh"]),
  safety_liveness: oneOf(["safety", "liveness", "both", "none"]),
  Rabin_index: NUMBER_OR_STRING_OR_NULL,
  Streett_index: NUMBER_OR_STRING_OR_NULL,
  acc_word: NULLABLE_STRING,
  rej_word: NULLABLE_STRING,
  stutter_invariant: flagOr(["no X"]),
  stutter_invariant_eq: STRING,
};

const COMPARE: Fields = {
  ...PARSE_INFO,
  txt: STRING,
  svg: STRING,
  w1: STRING,
  w2: STRING,
  w3: STRING,
  w4: STRING,
  sfh1: STRING,
  sfh1_text: STRING,
  sfh2: STRING,
  sfh2_text: STRING,
  parse_error2: STRING,
  prefix_syntax2: BOOLEAN,
};

const TRANSLATE: Fields = {
  ...PARSE_INFO,
  states: NUMBER,
  edges: NUMBER,
  det: BOOLEAN,
  note: STRING_ARRAY,
  automaton_svg: STRING,
  automaton_hoa: STRING,
  automaton_spin: STRING,
};

/**
 * Check that `body` is a JSON object whose declared fields have the types
 * `api/types.ts` promises.
 *
 * Every field is optional in the server's answers, so an absent key passes; a
 * key that is present must match. Values of undeclared keys are left alone.
 */
function checkFields(
  body: unknown,
  fields: Fields,
  url: string
): Record<string, unknown> {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new InvalidResponse(url, "it is not a JSON object");
  }
  const record = body as Record<string, unknown>;
  for (const [field, check] of Object.entries(fields)) {
    const value = record[field];
    if (value === undefined) continue;
    if (!check.test(value)) {
      throw new InvalidResponse(url, `"${field}" is not ${check.expected}`);
    }
  }
  return record;
}

/** `GET /api/rewrite/<formula>`. */
export function validateRewrite(body: unknown, url: string): RewriteResponse {
  return checkFields(body, REWRITE, url) as RewriteResponse;
}

/** `GET /api/study/<formula>`. */
export function validateStudy(body: unknown, url: string): StudyResponse {
  return checkFields(body, STUDY, url) as StudyResponse;
}

/** `GET /api/compare/<formula>`. */
export function validateCompare(body: unknown, url: string): CompareResponse {
  return checkFields(body, COMPARE, url) as CompareResponse;
}

/** `GET /api/translate/<formula>`. */
export function validateTranslate(body: unknown, url: string): TranslateResponse {
  return checkFields(body, TRANSLATE, url) as TranslateResponse;
}

/** `GET /api/random` — a bare JSON string. */
export function validateRandom(body: unknown, url: string): RandomResponse {
  if (!isString(body)) throw new InvalidResponse(url, "it is not a JSON string");
  return body;
}

/** `GET /api/versions` — one `[tool, version, url]` triplet per dependency. */
export function validateVersions(body: unknown, url: string): VersionsResponse {
  if (!Array.isArray(body)) throw new InvalidResponse(url, "it is not a JSON array");
  body.forEach((entry: unknown, index: number) => {
    // A triplet, though the last two entries may be null when unknown.
    if (!Array.isArray(entry) || entry.length !== 3) {
      throw new InvalidResponse(
        url,
        `entry ${index} is not a [tool, version, url] triplet`
      );
    }
    const [tool, version, link] = entry as unknown[];
    if (!isString(tool) || !(version === null || isString(version))) {
      throw new InvalidResponse(
        url,
        `entry ${index} does not name a tool and its version`
      );
    }
    if (!(link === null || isString(link))) {
      throw new InvalidResponse(url, `entry ${index} has a link that is not a string`);
    }
  });
  return body as VersionInfo[];
}
