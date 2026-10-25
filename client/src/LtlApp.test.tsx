import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { useState, version as reactVersion } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import App, { LtlApp } from "./App";
import { LtlInput } from "./components/LtlInput";
import { Versions } from "./components/Versions";
import { LtlCompare } from "./features/compare/LtlCompare";
import { LtlRewrite } from "./features/rewrite/LtlRewrite";
import { LtlStudy } from "./features/study/LtlStudy";
import { LtlTranslate } from "./features/translate/LtlTranslate";

interface PendingRequest {
  url: string;
  /** Answer the request with a JSON body. */
  respond: (body: unknown) => void;
  /** Answer the request with an HTTP error status. */
  fail: (status: number, statusText: string) => void;
}

/**
 * Mock `fetch` so that every request stays pending until the test answers it.
 * That makes the loading state last exactly as long as a test wants, which is
 * what the delayed-spinner assertions need.
 */
function stubFetch() {
  const requests: PendingRequest[] = [];
  const fetchMock = vi.fn(
    (input: RequestInfo | URL) =>
      new Promise<Response>((resolve) => {
        requests.push({
          url: String(input),
          respond: (body) =>
            resolve({
              ok: true,
              status: 200,
              statusText: "OK",
              json: async () => body,
            } as unknown as Response),
          fail: (status, statusText) =>
            resolve({
              ok: false,
              status,
              statusText,
              json: async () => ({}),
            } as unknown as Response),
        });
      })
  );
  vi.stubGlobal("fetch", fetchMock);
  return { fetchMock, requests };
}

/** Defaults of `LtlApp`'s state, so the option tests start where the app does. */
const DEFAULT_LTLSIMP = {
  br: true,
  lf: true,
  si: true,
  eu: true,
  lc: true,
  fs: false,
  pn: false,
  bi: false,
};
const NO_UNABBREV = {
  M: false,
  W: false,
  R: false,
  G: false,
  F: false,
  e: false,
  i: false,
  "^": false,
};

/** `LtlApp` starts with these simplification options enabled. */
const ENABLED_SIMPLIFICATIONS = ["br", "lf", "si", "eu", "lc"];

/**
 * The rewrite tab together with the state its parent owns in `LtlApp`, so the
 * option widgets really drive the request. Props the app passes through
 * unchanged are given no-ops.
 */
function RewriteTab({ expert = false }: { expert?: boolean }) {
  const [syntax, setSyntax] = useState("o");
  const [simplify, setSimplify] = useState(true);
  const [ltlsimp, setLtlsimp] = useState<Record<string, boolean>>(DEFAULT_LTLSIMP);
  const [unabbrev, setUnabbrev] = useState<Record<string, boolean>>(NO_UNABBREV);
  const [delta2, setDelta2] = useState(false);

  const handleChecked = (name: string) => (event: { target: { checked: boolean } }) => {
    if (name === "simplify") setSimplify(event.target.checked);
    else if (name === "delta2") setDelta2(event.target.checked);
  };
  const toggle = (setFlags: typeof setLtlsimp) => (key: string) => () =>
    setFlags((previous) => ({ ...previous, [key]: !previous[key] }));

  return (
    <LtlRewrite
      classes={{}}
      formula="a U b"
      syntax={syntax}
      simplify={simplify}
      ltlsimp={ltlsimp}
      unabbrev={unabbrev}
      delta2={delta2}
      expert={expert}
      handleChecked={handleChecked}
      changeSyntax={setSyntax}
      handleChangeLtlSimp={toggle(setLtlsimp)}
      handleChangeLtlUnabbrev={toggle(setUnabbrev)}
      handleAnyParseError={ignoreParseError}
    />
  );
}

function ignoreParseError() {}

/** Query parameters of a mocked request URL. */
function searchParams(url: string) {
  return new URL(url).searchParams;
}

/** Props of the rewrite tab; `hideoptions` keeps the rendering to the result. */
function rewriteProps(overrides: Record<string, unknown> = {}) {
  return {
    classes: {},
    formula: "a U b",
    syntax: "o",
    simplify: false,
    ltlsimp: {},
    unabbrev: {},
    delta2: false,
    expert: false,
    hideoptions: true,
    handleAnyParseError: () => {},
    changeSyntax: () => {},
    handleChecked: () => () => {},
    handleChangeLtlUnabbrev: () => {},
    handleChangeLtlSimp: () => {},
    ...overrides,
  };
}

/** Props of the formula input; the app passes the first two through unchanged. */
function inputProps(overrides: Record<string, unknown> = {}) {
  return {
    classes: {},
    className: "input",
    label: "Input formula",
    autoFocus: false,
    defaultValue: "",
    expert: false,
    setFormula: () => {},
    formulaerr: null,
    formulalbt: false,
    ...overrides,
  };
}

/** The progress indicator of the result panel (MUI CircularProgress). */
function spinner() {
  return screen.queryByRole("progressbar");
}

/** The textbox of the formula input. */
function readInput() {
  return screen.getByRole("textbox") as HTMLInputElement;
}

/** The dice button that overwrites the input with a random formula. */
function randomButton() {
  return screen.getByRole("button");
}

/**
 * Helper line of the input, shown while the text differs from the formula.
 * Matched on its trailing run of text: the words "Enter" and "Tab" sit in
 * their own <i> elements, which the text matcher does not descend into.
 */
const CONFIRM_HINT = /to update the results\./;

/** Note shown when the server fell back to a prefix syntax. */
const PREFIX_NOTE = /Assuming a prefix syntax/;

/**
 * The formula input and the rewrite tab sharing the state `LtlApp` owns, so the
 * parse information reported by the tab reaches the input.
 */
function FormulaAndRewrite() {
  const [formula, setFormula] = useState("a U b");
  const [formulaerr, setFormulaerr] = useState<string | null>(null);
  const [formulalbt, setFormulalbt] = useState(false);

  // The translation `LtlApp.handleAnyParseError` performs.
  const handleAnyParseError = (res: Record<string, unknown>) => {
    setFormulaerr("parse_error" in res ? (res.parse_error as string) : null);
    setFormulalbt(res.prefix_syntax === true);
  };

  return (
    <>
      <LtlInput
        {...inputProps({
          defaultValue: formula,
          setFormula,
          formulaerr,
          formulalbt,
        })}
      />
      <LtlRewrite {...rewriteProps({ formula, handleAnyParseError })} />
    </>
  );
}

/** Text shown for a request that failed with a 500. */
const MEMORY_NOTE = /automatically kills requests/;

describe("LtlRewrite", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("requests the formula and renders the rewritten result", async () => {
    const { fetchMock, requests } = stubFetch();
    render(<LtlRewrite {...rewriteProps()} />);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(requests[0].url).toContain("rewrite/a%20U%20b");

    await act(async () => requests[0].respond({ formula: "b | a" }));

    expect(screen.getByText("b | a")).toBeTruthy();
  });

  it("shows the spinner only after the request has been pending for 800 ms", async () => {
    vi.useFakeTimers();
    stubFetch();
    render(<LtlRewrite {...rewriteProps()} />);

    expect(spinner()).toBeNull();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(799);
    });

    expect(spinner()).toBeNull();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });

    expect(spinner()).not.toBeNull();
  });

  it("replaces the spinner with the answer when it arrives", async () => {
    vi.useFakeTimers();
    const { requests } = stubFetch();
    render(<LtlRewrite {...rewriteProps()} />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(800);
    });

    expect(spinner()).not.toBeNull();

    await act(async () => requests[0].respond({ formula: "b | a" }));

    expect(spinner()).toBeNull();
    expect(screen.getByText("b | a")).toBeTruthy();
  });

  it("never shows a spinner when the answer arrives quickly", async () => {
    vi.useFakeTimers();
    const { requests } = stubFetch();
    render(<LtlRewrite {...rewriteProps()} />);

    expect(spinner()).toBeNull();

    await act(async () => requests[0].respond({ formula: "b | a" }));
    // Let the pending 800 ms timer fire, if it was left behind.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(screen.getByText("b | a")).toBeTruthy();
    expect(spinner()).toBeNull();
  });

  it("shows the error for a failed request", async () => {
    const { requests } = stubFetch();
    render(<LtlRewrite {...rewriteProps()} />);

    await act(async () => requests[0].fail(500, "Internal Server Error"));

    expect(screen.getByText("500 Internal Server Error")).toBeTruthy();
    expect(screen.getByText(MEMORY_NOTE)).toBeTruthy();
    expect(spinner()).toBeNull();
  });

  it("shows only the message for a failure other than 500", async () => {
    const { requests } = stubFetch();
    render(<LtlRewrite {...rewriteProps()} />);

    await act(async () => requests[0].fail(404, "Not Found"));

    expect(screen.getByText("404 Not Found")).toBeTruthy();
    expect(screen.queryByText(MEMORY_NOTE)).toBeNull();
  });

  it("shows a syntax error reported by the server instead of a formula", async () => {
    const { requests } = stubFetch();
    render(<LtlRewrite {...rewriteProps()} />);

    const message = "The selected syntax only supports LTL formulas.";
    await act(async () => requests[0].respond({ error: message }));

    expect(screen.getByText(message)).toBeTruthy();
    expect(spinner()).toBeNull();
  });

  it("reports a parse error to the formula input", async () => {
    const handleAnyParseError = vi.fn();
    const { requests } = stubFetch();
    render(<LtlRewrite {...rewriteProps({ handleAnyParseError })} />);

    const response = { parse_error: "syntax error", prefix_syntax: true };
    await act(async () => requests[0].respond(response));

    expect(handleAnyParseError).toHaveBeenCalledWith(response);
  });

  it("does not query while the formula is empty", async () => {
    const { fetchMock } = stubFetch();
    render(<LtlRewrite {...rewriteProps({ formula: "" })} />);

    await act(async () => {});

    expect(fetchMock).not.toHaveBeenCalled();
    expect(spinner()).toBeNull();
  });
});

describe("LtlInput", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("shows the current formula without asking for confirmation", () => {
    render(<LtlInput {...inputProps({ defaultValue: "a U b" })} />);

    expect(readInput().value).toBe("a U b");
    expect(screen.queryByText(CONFIRM_HINT)).toBeNull();
    expect(screen.queryByText(PREFIX_NOTE)).toBeNull();
  });

  it("only submits an edit on Enter", () => {
    const setFormula = vi.fn();
    render(<LtlInput {...inputProps({ defaultValue: "a U b", setFormula })} />);

    fireEvent.change(readInput(), { target: { value: "a W b" } });

    // The text is shown at once, but the formula the app queries is untouched.
    expect(readInput().value).toBe("a W b");
    expect(screen.getByText(CONFIRM_HINT)).toBeTruthy();
    expect(setFormula).not.toHaveBeenCalled();

    fireEvent.keyDown(readInput(), { key: "Enter" });

    expect(setFormula).toHaveBeenCalledWith("a W b");
    expect(screen.queryByText(CONFIRM_HINT)).toBeNull();
  });

  it("submits an edit on blur", () => {
    const setFormula = vi.fn();
    render(<LtlInput {...inputProps({ defaultValue: "a U b", setFormula })} />);

    fireEvent.change(readInput(), { target: { value: "a W b" } });
    fireEvent.blur(readInput());

    expect(setFormula).toHaveBeenCalledWith("a W b");
    expect(screen.queryByText(CONFIRM_HINT)).toBeNull();
  });

  it("shows a parse error and marks the field invalid", () => {
    const { rerender } = render(
      <LtlInput {...inputProps({ defaultValue: "a U", formulaerr: "syntax error" })} />
    );

    expect(screen.getByText("syntax error").tagName).toBe("PRE");
    expect(readInput().getAttribute("aria-invalid")).toBe("true");

    rerender(<LtlInput {...inputProps({ defaultValue: "a", formulaerr: null })} />);

    expect(screen.queryByText("syntax error")).toBeNull();
    expect(readInput().getAttribute("aria-invalid")).not.toBe("true");
  });

  it("explains that a prefix syntax was assumed", () => {
    render(<LtlInput {...inputProps({ formulalbt: true })} />);

    expect(screen.getByText(PREFIX_NOTE)).toBeTruthy();
  });

  it("fills the input with a random formula", async () => {
    const { requests } = stubFetch();
    const setFormula = vi.fn();
    render(<LtlInput {...inputProps({ setFormula })} />);

    fireEvent.click(randomButton());

    expect(requests).toHaveLength(1);
    const url = new URL(requests[0].url);
    expect(url.pathname).toBe("/api/random");
    // LTL unless expert mode asks for PSL.
    expect(url.searchParams.has("p")).toBe(false);

    await act(async () => requests[0].respond("G F a"));

    expect(readInput().value).toBe("G F a");
    expect(setFormula).toHaveBeenCalledWith("G F a");
    // The formula is submitted directly, so nothing is left to confirm.
    expect(screen.queryByText(CONFIRM_HINT)).toBeNull();
  });

  it("asks for a PSL formula in expert mode", async () => {
    const { requests } = stubFetch();
    render(<LtlInput {...inputProps({ expert: true })} />);

    fireEvent.click(randomButton());

    expect(requests).toHaveLength(1);
    expect(new URL(requests[0].url).searchParams.get("p")).toBe("1");
  });

  it("replaces a pending edit with the random formula", async () => {
    const { requests } = stubFetch();
    render(<LtlInput {...inputProps({ defaultValue: "a U b" })} />);

    fireEvent.change(readInput(), { target: { value: "a W" } });
    expect(screen.getByText(CONFIRM_HINT)).toBeTruthy();

    fireEvent.click(randomButton());

    await act(async () => requests[0].respond("G a"));

    expect(readInput().value).toBe("G a");
    expect(screen.queryByText(CONFIRM_HINT)).toBeNull();
  });

  it("shows the parse error of the rewrite tab and clears it with the next answer", async () => {
    const { requests } = stubFetch();
    render(<FormulaAndRewrite />);

    await act(async () =>
      requests[0].respond({ parse_error: "syntax error", prefix_syntax: true })
    );

    expect(screen.getByText("syntax error")).toBeTruthy();
    expect(screen.getByText(PREFIX_NOTE)).toBeTruthy();
    expect(readInput().getAttribute("aria-invalid")).toBe("true");

    fireEvent.change(readInput(), { target: { value: "a | b" } });
    fireEvent.keyDown(readInput(), { key: "Enter" });

    expect(requests).toHaveLength(2);
    expect(requests[1].url).toContain("rewrite/a%20%7C%20b");

    await act(async () => requests[1].respond({ formula: "b | a" }));

    expect(screen.queryByText("syntax error")).toBeNull();
    expect(screen.queryByText(PREFIX_NOTE)).toBeNull();
    expect(readInput().getAttribute("aria-invalid")).not.toBe("true");
    expect(screen.getByText("b | a")).toBeTruthy();
  });
});

describe("LtlStudy", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  /** Props of the study tab; `classes` is the styled-injection prop. */
  function studyProps(overrides: Record<string, unknown> = {}) {
    return { classes: {}, formula: "G a", handleAnyParseError: () => {}, ...overrides };
  }

  it("requests the formula and describes its class", async () => {
    const { requests } = stubFetch();
    const handleAnyParseError = vi.fn();
    render(<LtlStudy {...studyProps({ handleAnyParseError })} />);

    expect(requests).toHaveLength(1);
    expect(new URL(requests[0].url).pathname).toBe("/api/study/G%20a");

    const response = {
      mp_class_text: "a safety property",
      mp_hierarchy_svg: "<svg></svg>",
      sfh_class: "Π₁",
      sfh_class_text: "It uses only weak temporal operators.",
    };
    await act(async () => requests[0].respond(response));

    expect(handleAnyParseError).toHaveBeenCalledWith(response);
    expect(screen.getByText("a safety property")).toBeTruthy();
    expect(screen.getByText("Safety-Liveness classification")).toBeTruthy();
  });

  it("does not query an empty formula and clears a previous parse error", async () => {
    const handleAnyParseError = vi.fn();
    const { fetchMock } = stubFetch();
    render(<LtlStudy {...studyProps({ formula: "", handleAnyParseError })} />);

    await act(async () => {});

    expect(fetchMock).not.toHaveBeenCalled();
    expect(handleAnyParseError).toHaveBeenCalledWith({});
  });
});

describe("LtlCompare", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  function compareProps(overrides: Record<string, unknown> = {}) {
    return {
      classes: {},
      formula: "a U b",
      formula2: "b U a",
      expert: false,
      hideoptions: true,
      handleChangeFormula2: () => {},
      handleAnyParseError: () => {},
      ...overrides,
    };
  }

  it("requests both formulas and reports each parse error", async () => {
    const { requests } = stubFetch();
    const handleAnyParseError = vi.fn();
    render(<LtlCompare {...compareProps({ handleAnyParseError })} />);

    expect(requests).toHaveLength(1);
    const url = new URL(requests[0].url);
    expect(url.pathname).toBe("/api/compare/a%20U%20b");
    expect(url.searchParams.get("g")).toBe("b U a");

    const response = {
      txt: "The two formulas are equivalent.",
      svg: "<svg></svg>",
      parse_error2: "syntax error in the second formula",
      prefix_syntax2: true,
    };
    await act(async () => requests[0].respond(response));

    // The first formula's parse information goes to the parent, the second
    // one to the input the tab renders itself.
    expect(handleAnyParseError).toHaveBeenCalledWith(response);
    expect(screen.getByText("The two formulas are equivalent.")).toBeTruthy();
    expect(screen.getByText("syntax error in the second formula")).toBeTruthy();
    expect(screen.getByText(PREFIX_NOTE)).toBeTruthy();
  });

  it("does not query while the second formula is empty", async () => {
    const { fetchMock } = stubFetch();
    render(<LtlCompare {...compareProps({ formula2: "" })} />);

    await act(async () => {});

    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("LtlTranslate", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  function translateProps(overrides: Record<string, unknown> = {}) {
    return {
      classes: {},
      formula: "a U b",
      acc: "p",
      autpref: "s",
      optlevel: "h",
      minmax: "max",
      oddeven: "odd",
      transopts: { complete: true, unambiguous: false, colored: false },
      expert: false,
      hideoptions: true,
      handleAnyParseError: () => {},
      changeAcc: () => {},
      changeAutpref: () => {},
      changeOptLevel: () => {},
      changeMinMax: () => {},
      changeOddEven: () => {},
      handleChangeTransOpts: () => () => {},
      ...overrides,
    };
  }

  /**
   * The translate tab with the acceptance condition its parent owns, so the
   * acceptance menu really drives the request.
   */
  function TranslateTab() {
    const [acc, setAcc] = useState("p");
    return (
      <LtlTranslate {...translateProps({ acc, changeAcc: setAcc, hideoptions: false })} />
    );
  }

  it("requests the translation and shows the automaton sources on demand", async () => {
    const { requests } = stubFetch();
    render(<LtlTranslate {...translateProps()} />);

    expect(requests).toHaveLength(1);
    const url = new URL(requests[0].url);
    expect(url.pathname).toBe("/api/translate/a%20U%20b");
    expect([...url.searchParams.entries()]).toEqual([
      ["a", "p"],
      ["p", "s"],
      ["l", "h"],
      ["m", "max"],
      ["e", "odd"],
      ["o", "complete"],
    ]);

    await act(async () =>
      requests[0].respond({
        states: 3,
        edges: 4,
        det: true,
        automaton_svg: "<svg></svg>",
        automaton_hoa: "HOA source",
        automaton_spin: "never claim source",
      })
    );

    expect(screen.getByText(/automaton with 3 states and 4 edges/)).toBeTruthy();
    // The sources stay hidden until their button is clicked, one at a time.
    expect(screen.queryByText("HOA source")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "HOA" }));
    expect(screen.getByText("HOA source")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "NeverClaim" }));
    expect(screen.queryByText("HOA source")).toBeNull();
    expect(screen.getByText("never claim source")).toBeTruthy();
  });

  it("does not query an empty formula", async () => {
    const { fetchMock } = stubFetch();
    render(<LtlTranslate {...translateProps({ formula: "" })} />);

    await act(async () => {});

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("renders its options when they are not hidden", () => {
    stubFetch();
    const handleChangeTransOpts = vi.fn(() => () => {});
    render(
      <LtlTranslate {...translateProps({ hideoptions: false, handleChangeTransOpts })} />
    );

    expect(
      screen.getByRole("radiogroup", { name: "Translation preferences" })
    ).toBeTruthy();
    expect(screen.getByLabelText("complete")).toBeTruthy();

    fireEvent.click(screen.getByLabelText("show SCCs"));

    expect(handleChangeTransOpts).toHaveBeenCalledWith("showscc");
  });

  it("requests the acceptance picked from its menu", async () => {
    const { requests } = stubFetch();
    render(<TranslateTab />);

    expect(searchParams(requests[0].url).get("a")).toBe("p");
    expect(searchParams(requests[0].url).get("m")).toBe("max");

    const menuButton = screen.getByRole("button", { name: "Acceptance to use" });
    fireEvent.click(menuButton);

    expect(screen.getAllByRole("menuitem").map((item) => item.textContent)).toEqual([
      "Acceptance: monitor (all runs accepting)",
      "Acceptance: co-Büchi",
      "Acceptance: Büchi",
      "Acceptance: Generalized Büchi",
      "Acceptance: parity",
      "Acceptance: Emerson-Lei (generic acceptance)",
    ]);
    // The acceptance in use is the one highlighted in the menu.
    expect(
      screen.getByRole("menuitem", { name: "Acceptance: parity" }).className
    ).toContain("Mui-selected");

    fireEvent.click(screen.getByRole("menuitem", { name: "Acceptance: co-Büchi" }));

    expect(requests).toHaveLength(2);
    const url = searchParams(requests[1].url);
    expect(url.get("a")).toBe("c");
    // The parity-only parameters go away with the parity acceptance, and the
    // rest of the request is untouched.
    expect(url.has("m")).toBe(false);
    expect(url.has("e")).toBe(false);
    expect(url.get("p")).toBe("s");
    expect(url.getAll("o")).toEqual(["complete"]);

    expect(menuButton.getAttribute("aria-expanded")).toBe("false");
    await waitFor(() => expect(menuButton.textContent).toContain("Acceptance: co-Büchi"));
  });
});

describe("LtlRewrite options", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("sends the simplification options only while Simplify is on", async () => {
    const { requests } = stubFetch();
    render(<RewriteTab />);

    expect(searchParams(requests[0].url).getAll("r")).toEqual(ENABLED_SIMPLIFICATIONS);

    await act(async () => requests[0].respond({ formula: "b | a" }));

    fireEvent.click(screen.getByLabelText("Simplify"));

    expect(requests).toHaveLength(2);
    expect(searchParams(requests[1].url).getAll("r")).toEqual([]);
    expect(searchParams(requests[1].url).get("ff")).toBe("o");

    fireEvent.click(screen.getByLabelText("Simplify"));

    expect(requests).toHaveLength(3);
    expect(searchParams(requests[2].url).getAll("r")).toEqual(ENABLED_SIMPLIFICATIONS);
  });

  it("stops sending a simplification option that is unchecked", async () => {
    const { requests } = stubFetch();
    render(<RewriteTab expert />);

    fireEvent.click(screen.getByLabelText("basic rewritings"));

    expect(requests).toHaveLength(2);
    expect(searchParams(requests[1].url).getAll("r")).toEqual(["lf", "si", "eu", "lc"]);
  });

  it("requests the selected output syntax from the syntax menu", async () => {
    const { requests } = stubFetch();
    render(<RewriteTab />);

    expect(searchParams(requests[0].url).get("ff")).toBe("o");

    fireEvent.click(screen.getByRole("button", { name: "LTL syntax to output" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Output syntax: Spin" }));

    expect(requests).toHaveLength(2);
    expect(searchParams(requests[1].url).get("ff")).toBe("i");
    // The syntax must not disturb the simplification options.
    expect(searchParams(requests[1].url).getAll("r")).toEqual(ENABLED_SIMPLIFICATIONS);

    await act(async () => requests[1].respond({ formula: "b U a" }));

    expect(screen.getByText("b U a")).toBeTruthy();
    expect(screen.getByText("Output syntax: Spin")).toBeTruthy();
  });

  it("lists every output syntax and marks the current one", async () => {
    stubFetch();
    render(<RewriteTab />);

    const menuButton = screen.getByRole("button", { name: "LTL syntax to output" });
    expect(screen.queryByRole("menu")).toBeNull();

    fireEvent.click(menuButton);

    expect(menuButton.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getAllByRole("menuitem").map((item) => item.textContent)).toEqual([
      "Output syntax: Spot",
      "Output syntax: LBT/LTL2DSTAR",
      "Output syntax: Spin",
      "Show Abstract Syntax Tree",
    ]);
    // The syntax in use is the one highlighted in the menu.
    expect(
      screen.getByRole("menuitem", { name: "Output syntax: Spot" }).className
    ).toContain("Mui-selected");
    expect(
      screen.getByRole("menuitem", { name: "Output syntax: Spin" }).className
    ).not.toContain("Mui-selected");

    fireEvent.click(screen.getByRole("menuitem", { name: "Output syntax: Spin" }));

    expect(menuButton.getAttribute("aria-expanded")).toBe("false");
    await waitFor(() => expect(menuButton.textContent).toContain("Output syntax: Spin"));
  });

  it("sends the selected un-abbreviations and drops them again", async () => {
    const { requests } = stubFetch();
    render(<RewriteTab />);

    expect(searchParams(requests[0].url).has("u")).toBe(false);

    fireEvent.click(screen.getByLabelText("F"));

    expect(searchParams(requests[1].url).get("u")).toBe("F");

    fireEvent.click(screen.getByLabelText("G"));

    // The flags are concatenated in the order the options are listed.
    expect(searchParams(requests[2].url).get("u")).toBe("GF");

    fireEvent.click(screen.getByLabelText("F"));

    expect(searchParams(requests[3].url).get("u")).toBe("G");

    fireEvent.click(screen.getByLabelText("G"));

    expect(searchParams(requests[4].url).has("u")).toBe(false);
  });

  it("sends Δ₂ only while its switch is on", async () => {
    const { requests } = stubFetch();
    render(<RewriteTab />);

    expect(searchParams(requests[0].url).has("d")).toBe(false);

    fireEvent.click(screen.getByLabelText("Rewrite as Δ₂"));

    expect(requests).toHaveLength(2);
    expect(searchParams(requests[1].url).get("d")).toBe("2");
    // Δ₂ must not disturb the other options.
    expect(searchParams(requests[1].url).get("ff")).toBe("o");
    expect(searchParams(requests[1].url).getAll("r")).toEqual(ENABLED_SIMPLIFICATIONS);

    fireEvent.click(screen.getByLabelText("Rewrite as Δ₂"));

    expect(requests).toHaveLength(3);
    expect(searchParams(requests[2].url).has("d")).toBe(false);
  });
});

describe("Versions", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("lists the versions reported by the server, plus React", async () => {
    const { requests } = stubFetch();
    render(<Versions classes={{}} />);

    expect(requests).toHaveLength(1);
    expect(new URL(requests[0].url).pathname).toBe("/api/versions");

    await act(async () =>
      requests[0].respond([
        ["Spot", "2.11.6", "https://spot.lrde.epita.fr/"],
        ["Flask", "2.2.2", "http://flask.pocoo.org/"],
      ])
    );

    fireEvent.click(screen.getByRole("button", { name: "Versions" }));

    expect(await screen.findByText("Spot")).toBeTruthy();
    expect(screen.getByText("2.11.6")).toBeTruthy();
    // The client is not part of the server's list, so it appends itself.
    expect(screen.getByText("React")).toBeTruthy();
    expect(screen.getByText(reactVersion)).toBeTruthy();
  });
});

describe("app shell", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("opens the help panel and duplicates the app", () => {
    stubFetch();
    render(<App />);

    expect(screen.getByRole("tab", { name: "Translate" })).toBeTruthy();
    expect(screen.getByLabelText("Input formula")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "help" }));

    // The help panel is one long document; check that it rendered with its
    // sections, and that its own close button removes it again.
    expect(screen.getByText("Help")).toBeTruthy();
    expect(screen.getByText("About")).toBeTruthy();
    expect(screen.getByText("Operation modes")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "close" }));
    expect(screen.queryByText("Operation modes")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "dup" }));
    expect(screen.getAllByLabelText("Input formula")).toHaveLength(2);

    fireEvent.click(screen.getByRole("button", { name: "close" }));
    expect(screen.getAllByLabelText("Input formula")).toHaveLength(1);
  });
});

describe("LtlApp expert mode", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  /** Random-formula requests, i.e. those the dice buttons sent. */
  function randomRequests(requests: PendingRequest[]) {
    return requests
      .map((request) => new URL(request.url))
      .filter((url) => url.pathname === "/api/random");
  }

  /** The dice button of the input whose textbox is `input`. */
  function randomButtonFor(input: HTMLElement) {
    // The button is the input's adornment, next to it in the same wrapper.
    return within(input.parentElement as HTMLElement).getByRole("button");
  }

  it("reaches the compare tab's second formula input", () => {
    const { requests } = stubFetch();
    render(<LtlApp classes={{}} />);

    fireEvent.click(screen.getByRole("tab", { name: "Compare" }));

    // Without expert mode the generator produces LTL.
    fireEvent.click(randomButtonFor(screen.getByLabelText("Second formula")));
    expect(randomRequests(requests).at(-1)?.searchParams.has("p")).toBe(false);

    fireEvent.click(screen.getByLabelText("Expert mode"));
    fireEvent.click(randomButtonFor(screen.getByLabelText("Second formula")));

    // Expert mode asks the server for a PSL formula.
    expect(randomRequests(requests).at(-1)?.searchParams.get("p")).toBe("1");
  });
});
