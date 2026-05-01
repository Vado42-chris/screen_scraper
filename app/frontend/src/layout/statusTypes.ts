export type UiOutcomeState =
  | "success"
  | "failed"
  | "blocked"
  | "needs-confirmation"
  | "not-configured"
  | "unknown";

export type UiStatusState =
  | "confirmed"
  | "unknown"
  | "missing"
  | "changed"
  | "drift"
  | "blocked"
  | "safe-to-run"
  | "risky"
  | "failed"
  | "success";

export type UiRiskLevel = "low" | "medium" | "high" | "critical";
