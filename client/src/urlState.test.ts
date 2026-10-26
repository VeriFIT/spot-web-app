import { describe, expect, it } from "vitest";

import { INITIAL_OPTIONS } from "./options";
import {
  actionOfMode,
  DEFAULT_MODE,
  modeOfAction,
  searchFromState,
  stateFromSearch,
} from "./urlState";

/*
 * The URL is the only place the app keeps its state, so these tests pin down
 * what a link means: the mode is a path segment, everything that changes the
 * answer is a query parameter, and anything that is at its default is left out.
 */

describe("mode paths", () => {
  it("maps the four modes to the tab numbers", () => {
    expect(actionOfMode("rewrite")).toBe(0);
    expect(actionOfMode("study")).toBe(1);
    expect(actionOfMode("compare")).toBe(2);
    expect(actionOfMode("translate")).toBe(3);
  });

  it("rejects a path segment that is not a mode", () => {
    expect(actionOfMode("nope")).toBeNull();
    expect(actionOfMode("")).toBeNull();
    expect(actionOfMode(undefined)).toBeNull();
  });

  it("maps a tab number back to its mode", () => {
    expect(modeOfAction(2)).toBe("compare");
    expect(DEFAULT_MODE).toBe(modeOfAction(INITIAL_OPTIONS.action));
    expect(DEFAULT_MODE).toBe("translate");
  });
});

describe("searchFromState", () => {
  it("writes nothing when everything is at its default", () => {
    expect(searchFromState(INITIAL_OPTIONS, "", "")).toBe("");
  });

  it("writes the formulas and the options that differ", () => {
    const options = { ...INITIAL_OPTIONS, syntax: "l", acc: "p", minmax: "max" };

    expect(searchFromState(options, "a U b", "b U a")).toBe(
      "?f=a+U+b&g=b+U+a&syntax=l&acc=p&minmax=max"
    );
  });

  it("writes a flag map as its enabled keys", () => {
    const options = {
      ...INITIAL_OPTIONS,
      ltlsimp: { ...INITIAL_OPTIONS.ltlsimp, br: true, lf: false, si: false },
      unabbrev: { ...INITIAL_OPTIONS.unabbrev, F: true },
      transopts: { ...INITIAL_OPTIONS.transopts, complete: true },
    };

    // The simplifications that are on by default are gone, so the URL lists
    // exactly what the response depends on.
    expect(searchFromState(options, "", "")).toBe("?simp=br,eu,lc&unab=F&trans=complete");
  });
});

describe("stateFromSearch", () => {
  it("reads back what it wrote", () => {
    const options = {
      ...INITIAL_OPTIONS,
      action: 2,
      syntax: "g",
      simplify: false,
      ltlsimp: { ...INITIAL_OPTIONS.ltlsimp, lc: false, fs: true },
      delta2: true,
      unabbrev: { ...INITIAL_OPTIONS.unabbrev, F: true, W: true },
      acc: "e",
      autpref: "a",
      optlevel: "l",
      minmax: "min",
      oddeven: "even",
      transopts: { ...INITIAL_OPTIONS.transopts, complete: true, colored: true },
    };

    const search = searchFromState(options, "G a", "F b");
    const state = stateFromSearch(search, 2);

    expect(state.options).toEqual(options);
    expect(state.formula).toBe("G a");
    expect(state.formula2).toBe("F b");
  });

  it("falls back to the defaults for an empty URL", () => {
    const state = stateFromSearch("", 3);

    expect(state.options).toEqual(INITIAL_OPTIONS);
    expect(state.formula).toBe("");
    expect(state.formula2).toBe("");
  });

  it("ignores values it does not recognise", () => {
    const { options } = stateFromSearch(
      "?syntax=zzz&acc=q&pref=x&opt=s&minmax=nope&oddeven=lots&simplify=2&delta2=yes",
      3
    );

    expect(options.syntax).toBe("o");
    expect(options.acc).toBe("g");
    expect(options.autpref).toBe("s");
    expect(options.optlevel).toBe("h");
    expect(options.minmax).toBe("any");
    expect(options.oddeven).toBe("any");
    expect(options.simplify).toBe(true);
    expect(options.delta2).toBe(false);
  });

  it("takes a flag list as the complete set of enabled flags", () => {
    const { options } = stateFromSearch("?simp=lc&unab=Q", 0);

    expect(options.ltlsimp).toEqual({
      br: false,
      lf: false,
      si: false,
      eu: false,
      lc: true,
      fs: false,
      pn: false,
      bi: false,
    });
    // Unknown keys enable nothing.
    expect(Object.values(options.unabbrev).some(Boolean)).toBe(false);
  });
});
