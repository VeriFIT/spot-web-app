import { describe, expect, it } from "vitest";

import { INITIAL_OPTIONS } from "./options";
import {
  actionOfMode,
  DEFAULT_MODE,
  modeOfAction,
  panelsFromSearch,
  searchFromPanels,
} from "./urlState";
import type { PanelState } from "./urlState";

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

/** One panel made of the options and formulas a test cares about. */
function panel(
  options: PanelState["options"] = INITIAL_OPTIONS,
  formula = "",
  formula2 = ""
): PanelState {
  return { options, formula, formula2 };
}

describe("searchFromPanels with one panel", () => {
  it("writes nothing when everything is at its default", () => {
    expect(searchFromPanels(panel(), null)).toBe("");
  });

  it("writes the formulas and the options that differ", () => {
    const options = { ...INITIAL_OPTIONS, syntax: "l", acc: "p", minmax: "max" };

    expect(searchFromPanels(panel(options, "a U b", "b U a"), null)).toBe(
      "?f=a+U+b&g=b+U+a&syntax=l&acc=p&minmax=max"
    );
  });

  it("writes the display preferences of the panel", () => {
    const options = { ...INITIAL_OPTIONS, expert: true, hideoptions: true };

    // They change what the panel shows, not what it asks the server, but they
    // are part of the view a link should restore.
    expect(searchFromPanels(panel(options), null)).toBe("?expert=1&hideoptions=1");
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
    expect(searchFromPanels(panel(options), null)).toBe(
      "?simp=br,eu,lc&unab=F&trans=complete"
    );
  });
});

describe("panelsFromSearch with one panel", () => {
  it("reads back what it wrote", () => {
    const options = {
      ...INITIAL_OPTIONS,
      action: 2,
      expert: true,
      hideoptions: true,
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

    const search = searchFromPanels(panel(options, "G a", "F b"), null);
    const state = panelsFromSearch(search, 2).primary;

    expect(state.options).toEqual(options);
    expect(state.formula).toBe("G a");
    expect(state.formula2).toBe("F b");
  });

  it("falls back to the defaults for an empty URL", () => {
    const state = panelsFromSearch("", 3).primary;

    expect(state.options).toEqual(INITIAL_OPTIONS);
    expect(state.formula).toBe("");
    expect(state.formula2).toBe("");
  });

  it("ignores values it does not recognise", () => {
    const { options } = panelsFromSearch(
      "?syntax=zzz&acc=q&pref=x&opt=s&minmax=nope&oddeven=lots&simplify=2&delta2=yes",
      3
    ).primary;

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
    const { options } = panelsFromSearch("?simp=lc&unab=Q", 0).primary;

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

describe("the duplicate panel", () => {
  const primary: PanelState = {
    options: { ...INITIAL_OPTIONS, action: 0 },
    formula: "G a",
    formula2: "",
  };
  const fresh: PanelState = { options: INITIAL_OPTIONS, formula: "", formula2: "" };

  it("adds nothing while it is closed", () => {
    expect(searchFromPanels(primary, null)).toBe("?f=G+a");
  });

  it("writes its mode alone when everything else is at its default", () => {
    // The presence of `p2-mode` is what says the panel is open.
    expect(searchFromPanels(primary, fresh)).toBe("?f=G+a&p2-mode=translate");
  });

  it("prefixes the parameters of the second panel", () => {
    const secondary: PanelState = {
      options: {
        ...INITIAL_OPTIONS,
        action: 1,
        expert: true,
        acc: "c",
        transopts: { ...INITIAL_OPTIONS.transopts, complete: true },
      },
      formula: "F b",
      formula2: "",
    };

    expect(searchFromPanels(primary, secondary)).toBe(
      "?f=G+a&p2-mode=study&p2-expert=1&p2-f=F+b&p2-acc=c&p2-trans=complete"
    );
  });

  it("reads both panels back", () => {
    const { primary: first, secondary } = panelsFromSearch(
      "?f=G+a&syntax=l&p2-mode=compare&p2-f=F+b&p2-g=a&p2-syntax=i",
      0
    );

    expect(first.formula).toBe("G a");
    expect(first.options.syntax).toBe("l");
    expect(secondary).not.toBeNull();
    expect(secondary!.options.action).toBe(2);
    expect(secondary!.options.syntax).toBe("i");
    expect(secondary!.formula).toBe("F b");
    expect(secondary!.formula2).toBe("a");
  });

  it("leaves the panel closed without a mode, and defaults an unknown one", () => {
    expect(panelsFromSearch("?f=G+a", 0).secondary).toBeNull();

    const { secondary } = panelsFromSearch("?p2-mode=nonsense", 3);
    expect(secondary!.options.action).toBe(INITIAL_OPTIONS.action);
  });

  it("round-trips a second panel with its own options", () => {
    const primaryState: PanelState = {
      options: { ...INITIAL_OPTIONS, action: 2, acc: "p" },
      formula: "a U b",
      formula2: "b U a",
    };
    const secondaryState: PanelState = {
      options: {
        ...INITIAL_OPTIONS,
        action: 0,
        syntax: "i",
        simplify: false,
        ltlsimp: { ...INITIAL_OPTIONS.ltlsimp, lc: false },
        delta2: true,
        unabbrev: { ...INITIAL_OPTIONS.unabbrev, F: true },
      },
      formula: "G b",
      formula2: "",
    };

    const search = searchFromPanels(primaryState, secondaryState);
    const state = panelsFromSearch(search, 2);

    expect(state.primary).toEqual(primaryState);
    expect(state.secondary).toEqual(secondaryState);
  });
});
