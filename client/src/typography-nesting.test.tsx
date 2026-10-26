import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { NoteText } from "./components/NoteText";
import { Help } from "./features/help/Help";

/**
 * Elements that may not appear inside a `<p>`. A paragraph only holds phrasing
 * content, so a browser closes it at the first of these: the resulting DOM then
 * disagrees with what React rendered, which confuses assistive technology and
 * logs a `validateDOMNesting` warning.
 */
const BLOCK_CONTENT = [
  "address",
  "article",
  "aside",
  "blockquote",
  "details",
  "div",
  "dl",
  "fieldset",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "hr",
  "ol",
  "p",
  "pre",
  "section",
  "table",
  "ul",
].join(",");

/**
 * Paragraphs that contain block content, described as `<div> inside <p>`.
 * `Typography` renders a `<p>` unless told otherwise, so a `Typography` holding
 * a table or another `Typography` shows up here.
 */
function nestedBlocks(root: HTMLElement): string[] {
  return Array.from(root.querySelectorAll("p"))
    .flatMap((paragraph) =>
      Array.from(paragraph.querySelectorAll(BLOCK_CONTENT)).map(
        (child) => `<${child.tagName.toLowerCase()}> inside <p>`
      )
    )
    .sort();
}

describe("Typography nesting", () => {
  afterEach(cleanup);

  it("keeps block content out of the help paragraphs", () => {
    const { container } = render(<Help onClose={() => {}} />);

    // The panel is long enough that a mistake here is easy to make; the
    // operator tables and the two definition lists are the reason the check
    // exists.
    expect(container.querySelectorAll("p").length).toBeGreaterThan(20);
    expect(nestedBlocks(container)).toEqual([]);
  });

  it("lays a note out as a row, not as a table", () => {
    const { container } = render(<NoteText text="a note" />);

    // The icon and the text are one line, not tabular data; a table here is
    // also what used to force the wrapper to be a <div> rather than a <p>.
    expect(container.querySelector("table")).toBeNull();
    expect(container.textContent).toBe("a note");
    expect(nestedBlocks(container)).toEqual([]);
  });
});
