import { describe, expect, it } from "vitest";

import {
  InvalidResponse,
  validateCompare,
  validateRandom,
  validateRewrite,
  validateStudy,
  validateTranslate,
  validateVersions,
} from "./validate";

const URL = "/api/study/G%20a";

/** The message of the error `fn` throws, or `null` when it throws nothing. */
function failure(fn: () => unknown): string | null {
  try {
    fn();
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
}

describe("response validation", () => {
  it("returns a complete document unchanged", () => {
    const study = {
      mp_class: "S",
      mp_class_text: "a safety property",
      safety_liveness: "safety",
      Rabin_index: 1,
      Streett_index: 1,
      acc_word: "Ga",
      rej_word: null,
      stutter_invariant: "no X",
      pathological: "sfh",
    };
    expect(validateStudy(study, URL)).toBe(study);
  });

  it("accepts a sparse answer, since every field is optional", () => {
    // The server only sends the keys that carry information.
    expect(validateRewrite({}, URL)).toEqual({});
    expect(validateTranslate({ parse_error: "syntax error" }, URL)).toEqual({
      parse_error: "syntax error",
    });
  });

  it("leaves keys it does not know alone", () => {
    const body = { formula: "Ga", surprise: 42 };
    expect(validateRewrite(body, URL)).toBe(body);
  });

  it("rejects a body that is not a JSON object", () => {
    expect(failure(() => validateRewrite(null, URL))).toContain(
      "Unexpected answer from /api/study/G%20a: it is not a JSON object"
    );
    expect(failure(() => validateRewrite(["formula"], URL))).toContain(
      "is not a JSON object"
    );
    expect(failure(() => validateTranslate("states", URL))).toContain(
      "is not a JSON object"
    );
  });

  it("names the endpoint and the field that has the wrong type", () => {
    const message = failure(() => validateRewrite({ formula: 3 }, URL));
    expect(message).toBe(
      'Unexpected answer from /api/study/G%20a: "formula" is not a string'
    );
    expect(new InvalidResponse(URL, "x")).toBeInstanceOf(Error);
    expect(new InvalidResponse(URL, "x").name).toBe("InvalidResponse");
  });

  it("checks lists, nullables and enumerated values", () => {
    expect(failure(() => validateTranslate({ note: "a note" }, URL))).toContain(
      '"note" is not a list of strings'
    );
    expect(failure(() => validateTranslate({ note: ["ok", 2] }, URL))).toContain(
      '"note" is not a list of strings'
    );
    expect(failure(() => validateStudy({ acc_word: 1 }, URL))).toContain(
      '"acc_word" is not a string or null'
    );
    expect(failure(() => validateStudy({ safety_liveness: "maybe" }, URL))).toContain(
      '"safety_liveness" is not one of "safety", "liveness", "both", "none"'
    );
    expect(failure(() => validateStudy({ Rabin_index: true }, URL))).toContain(
      '"Rabin_index" is not a number, a string or null'
    );
  });

  it("accepts the words the server sends in place of a boolean", () => {
    expect(
      validateStudy({ pathological: "sfh", stutter_invariant: "no X" }, URL)
    ).toEqual({
      pathological: "sfh",
      stutter_invariant: "no X",
    });
    expect(failure(() => validateStudy({ pathological: "yes" }, URL))).toContain(
      '"pathological" is not a boolean or one of "sfh"'
    );
    expect(failure(() => validateStudy({ stutter_invariant: "no" }, URL))).toContain(
      '"stutter_invariant" is not a boolean or one of "no X"'
    );
  });

  it("checks the automaton counts and flags of a translation", () => {
    expect(
      validateTranslate(
        { states: 3, edges: 4, det: true, automaton_hoa: "HOA", automaton_svg: "<svg/>" },
        URL
      )
    ).toMatchObject({ states: 3, det: true });
    expect(failure(() => validateTranslate({ states: "3" }, URL))).toContain(
      '"states" is not a number'
    );
    expect(failure(() => validateCompare({ w2: false }, URL))).toContain(
      '"w2" is not a string'
    );
  });

  it("checks the versions list entry by entry", () => {
    const versions = [
      ["spot", "2.16", "https://spot.lre.epita.fr/"],
      ["react", null, null],
    ];
    expect(validateVersions(versions, "/api/versions")).toBe(versions);

    expect(failure(() => validateVersions({}, "/api/versions"))).toContain(
      "it is not a JSON array"
    );
    expect(
      failure(() => validateVersions([["spot", "2.16"]], "/api/versions"))
    ).toContain("entry 0 is not a [tool, version, url] triplet");
    expect(
      failure(() => validateVersions([["spot", 2, null]], "/api/versions"))
    ).toContain("entry 0 does not name a tool and its version");
    expect(
      failure(() => validateVersions([["spot", null, 2]], "/api/versions"))
    ).toContain("entry 0 has a link that is not a string");
  });

  it("checks that a random formula really is a string", () => {
    expect(validateRandom("G a", "/api/random")).toBe("G a");
    expect(failure(() => validateRandom({ formula: "G a" }, "/api/random"))).toContain(
      "it is not a JSON string"
    );
  });
});
