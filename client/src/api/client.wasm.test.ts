import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, fetchJson } from "./client";

// What the WebAssembly API answers when Spot throws: a 500 carrying the
// exception's message, which may contain a newline.
vi.mock("./local/backend", () => ({
  localFetch: () =>
    Promise.resolve({ status: 500, body: null, error: "unknown option 'parity \n'" }),
}));

describe("fetchJson in the client-only build", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("turns an error of the WebAssembly API into an ApiError", async () => {
    vi.stubEnv("VITE_SPOT_BACKEND", "wasm");

    const result = fetchJson("/api/translate/a?a=p&m=%0A", undefined, (body) => body);

    await expect(result).rejects.toBeInstanceOf(ApiError);
    await expect(result).rejects.toMatchObject({
      status: 500,
      message: "500 unknown option 'parity \n'",
    });
  });
});
