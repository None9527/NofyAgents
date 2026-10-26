/** ExitPlanModeExtRequest carries the kernel-read plan file contents, not a client path. */
export function readPlan(params: Record<string, unknown>): string | null {
  return typeof params.planContent === "string" && params.planContent.trim().length > 0 ? params.planContent : null;
}

export function planResponse(outcome: "approved" | "cancelled" | "abandoned", feedback = ""): Record<string, unknown> {
  return outcome === "cancelled" && feedback.trim() ? { outcome, feedback: feedback.trim() } : { outcome };
}
