import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ErrorBoundary } from "./ErrorBoundary";

/** A child that fails to render, standing in for a malformed response. */
function Boom(): never {
  throw new Error("kaboom");
}

describe("ErrorBoundary", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders its children when nothing throws", () => {
    render(
      <ErrorBoundary>
        <p>the result</p>
      </ErrorBoundary>
    );

    expect(screen.getByText("the result")).toBeTruthy();
  });

  it("shows a message when a child throws, and logs the error", () => {
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    );

    expect(screen.getByText("This panel could not be displayed")).toBeTruthy();
    expect(screen.getByText("kaboom")).toBeTruthy();
    // The only way out of the failed state, short of a new page load.
    expect(screen.getByRole("button", { name: "Reload the page" })).toBeTruthy();
    expect(logged).toHaveBeenCalled();
  });
});
