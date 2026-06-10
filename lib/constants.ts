export const APP_NAME = "Resume Shapeshifter";

export const APP_DESCRIPTION =
  "Truthful JD-to-resume tailoring with match scoring, gap analysis, and side-by-side PDF proof.";

export const MIN_INPUT_LENGTH = 100;

export const DEFAULT_MAX_RESUME_CHARS = 32_000;

export const DEFAULT_MAX_JD_CHARS = 16_000;

export const DEFAULT_RATE_LIMIT_PER_HOUR = 10;

export const ROUTES = {
  home: "/",
  input: "/input",
  analyze: "/analyze",
  review: "/review",
  export: "/export",
} as const;

export const PHASE_LABELS = {
  input: "Input",
  analyze: "Analyze",
  review: "Review",
  export: "Export",
} as const;
