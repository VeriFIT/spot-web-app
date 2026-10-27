import type { ReactNode } from "react";
import { Link } from "react-router";

import { INITIAL_OPTIONS, type Options } from "../../options";
import { MODES, searchFromPanels, type Mode } from "../../urlState";

/**
 * The default preferences with `overrides` applied. The nested flag groups are
 * merged key by key, so an example only has to name the flags it turns on.
 */
function optionsWith(overrides: Partial<Options> | undefined): Options {
  return {
    ...INITIAL_OPTIONS,
    ...overrides,
    transopts: { ...INITIAL_OPTIONS.transopts, ...overrides?.transopts },
    unabbrev: { ...INITIAL_OPTIONS.unabbrev, ...overrides?.unabbrev },
    ltlsimp: { ...INITIAL_OPTIONS.ltlsimp, ...overrides?.ltlsimp },
  };
}

/**
 * A link to one mode of the application, with an example formula and options
 * if given.
 *
 * It is an in-app link, so the panel changes next to the help panel instead of
 * the page reloading. Its query string is built by `searchFromPanels`, the
 * writer the panels themselves use, so a help link and a URL copied out of the
 * address bar are spelled the same way.
 */
export function ModeLink({
  mode,
  formula = "",
  formula2 = "",
  options,
  children,
}: {
  mode: Mode;
  /** The formula the mode opens on; empty for a bare link to the mode. */
  formula?: string;
  /** The second formula, which only the compare mode has a use for. */
  formula2?: string;
  /** The preferences the mode opens with; the defaults for the rest. */
  options?: Partial<Options>;
  children?: ReactNode;
}) {
  // The mode is the path segment of the target, so it is what the panel's
  // `action` would be, whatever an override says.
  const panel = optionsWith({ ...options, action: MODES.indexOf(mode) });
  const query = searchFromPanels({ options: panel, formula, formula2 }, null);

  return <Link to={"/" + mode + query}>{children}</Link>;
}
