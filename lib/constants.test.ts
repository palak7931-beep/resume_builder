import { describe, expect, it } from "vitest";

import { hashContent } from "@/lib/hash";
import { APP_NAME, MIN_INPUT_LENGTH } from "@/lib/constants";

describe("Phase 0 foundation", () => {
  it("exports app constants", () => {
    expect(APP_NAME).toBe("Resume Shapeshifter");
    expect(MIN_INPUT_LENGTH).toBeGreaterThan(0);
  });

  it("hashes content deterministically", () => {
    const hash = hashContent("sample resume text");
    expect(hash).toHaveLength(64);
    expect(hashContent("sample resume text")).toBe(hash);
  });
});
