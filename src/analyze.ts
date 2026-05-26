import {
  PRIVILEGED_ROLE_TEMPLATE_IDS,
  type AccessReviewDecision,
  type AccessReviewInstance,
  type ControlPlaneOptions,
  type ControlPlaneReport,
  type DecisionState,
  type Finding,
  type InstanceStatus,
  type ReviewInput
} from "./types.js";

const DAY_MS = 86_400_000;

const DECISION_STATES: DecisionState[] = [
  "approve",
  "deny",
  "dontKnow",
  "notReviewed",
  "notNotified"
];

const INSTANCE_STATUSES: InstanceStatus[] = [
  "NotStarted",
  "Initializing",
  "InProgress",
  "Completing",
  "Completed",
  "Auto-Reviewing",
  "Auto-Reviewed"
];

function emptyDecisionCounts(): Record<DecisionState, number> {
  const out = {} as Record<DecisionState, number>;
  for (const s of DECISION_STATES) out[s] = 0;
  return out;
}

function emptyInstanceCounts(): Record<InstanceStatus, number> {
  const out = {} as Record<InstanceStatus, number>;
  for (const s of INSTANCE_STATUSES) out[s] = 0;
  return out;
}

/** Normalize the three accepted input shapes into a flat instance array. */
export function normalizeInput(input: ReviewInput): AccessReviewInstance[] {
  if (Array.isArray(input)) return input;
  if ("value" in input && Array.isArray((input as { value: AccessReviewInstance[] }).value)) {
    return (input as { value: AccessReviewInstance[] }).value;
  }
  return [input as AccessReviewInstance];
}

/** Run all rules against the input and produce a control-plane report. */
export function analyze(input: ReviewInput, opts: ControlPlaneOptions = {}): ControlPlaneReport {
  const now = opts.now ? new Date(opts.now) : new Date();
  const overdueAfter = (opts.overdueAfterDays ?? 14) * DAY_MS;
  const staleAfter = (opts.staleAfterDays ?? 30) * DAY_MS;

  const instances = normalizeInput(input);
  const findings: Finding[] = [];
  const decisionsByState = emptyDecisionCounts();
  const instancesByStatus = emptyInstanceCounts();
  let totalDecisions = 0;
  let openPrivilegedDecisions = 0;

  for (const inst of instances) {
    if (inst.status in instancesByStatus) instancesByStatus[inst.status] += 1;

    const endDate = new Date(inst.endDateTime);
    const overdueByMs = now.getTime() - endDate.getTime();
    if (inst.status !== "Completed" && inst.status !== "Auto-Reviewed" && overdueByMs > 0) {
      findings.push({
        code: "instance-overdue",
        severity: overdueByMs > overdueAfter ? "high" : "medium",
        message: `Access review instance closed ${Math.round(overdueByMs / DAY_MS)} day(s) ago and still ${inst.status}.`,
        instanceId: inst.id
      });
    }

    for (const d of inst.decisions ?? []) {
      totalDecisions += 1;
      if (d.decision in decisionsByState) decisionsByState[d.decision] += 1;

      const isPrivileged =
        d.resource.type === "role" &&
        d.resource.roleTemplateId !== undefined &&
        PRIVILEGED_ROLE_TEMPLATE_IDS.has(d.resource.roleTemplateId);

      const isOpen = d.decision === "notReviewed" || d.decision === "notNotified";
      if (isOpen && isPrivileged) openPrivilegedDecisions += 1;

      if (isOpen && overdueByMs > overdueAfter) {
        findings.push({
          code: "decision-overdue",
          severity: isPrivileged ? "high" : "medium",
          message: `Decision pending for ${d.principal.displayName ?? d.principal.id} on ${d.resource.displayName ?? d.resource.id}.`,
          instanceId: inst.id,
          decisionId: d.id,
          principal: d.principal.userPrincipalName ?? d.principal.id,
          resource: d.resource.displayName ?? d.resource.id
        });
      }

      if (isPrivileged && d.decision === "approve" && d.reviewedBy === undefined) {
        findings.push({
          code: "privileged-role-auto-approved",
          severity: "high",
          message: `Privileged role decision approved with no recorded reviewer (likely auto-approval).`,
          instanceId: inst.id,
          decisionId: d.id,
          principal: d.principal.userPrincipalName ?? d.principal.id,
          resource: d.resource.displayName ?? d.resource.id
        });
      }

      if (
        d.reviewedBy?.id &&
        d.principal.type === "user" &&
        d.reviewedBy.id === d.principal.id
      ) {
        findings.push({
          code: "reviewer-self-review",
          severity: isPrivileged ? "high" : "medium",
          message: `Reviewer ${d.reviewedBy.displayName ?? d.reviewedBy.id} approved/denied their own access.`,
          instanceId: inst.id,
          decisionId: d.id,
          principal: d.principal.userPrincipalName ?? d.principal.id,
          resource: d.resource.displayName ?? d.resource.id
        });
      }

      if (d.reviewedDateTime && !d.appliedDateTime) {
        const reviewedAgeMs = now.getTime() - new Date(d.reviewedDateTime).getTime();
        if (reviewedAgeMs > staleAfter) {
          findings.push({
            code: "stale-decision",
            severity: "medium",
            message: `Decision reviewed ${Math.round(reviewedAgeMs / DAY_MS)} day(s) ago but never applied.`,
            instanceId: inst.id,
            decisionId: d.id,
            principal: d.principal.userPrincipalName ?? d.principal.id,
            resource: d.resource.displayName ?? d.resource.id
          });
        }
      }

      if (isPrivileged && (d.principal.type === "user" || d.principal.type === undefined)) {
        // Informational signal — surfaces every privileged-role decision so the operator
        // can scan them on the dashboard even when there's no rule violation.
        findings.push({
          code: "high-risk-principal",
          severity: "info",
          message: `Privileged role assignment under review (${d.resource.displayName ?? d.resource.roleTemplateId}).`,
          instanceId: inst.id,
          decisionId: d.id,
          principal: d.principal.userPrincipalName ?? d.principal.id,
          resource: d.resource.displayName ?? d.resource.id
        });
      }
    }
  }

  const ok = !findings.some((f) => f.severity === "high");

  return {
    generatedAt: now.toISOString(),
    instances: instances.length,
    decisions: totalDecisions,
    decisionsByState,
    instancesByStatus,
    openPrivilegedDecisions,
    findings,
    ok
  };
}

/** Convenience overload for an already-flattened decision array. */
export function analyzeDecisions(
  instanceId: string,
  status: InstanceStatus,
  endDateTime: string,
  decisions: AccessReviewDecision[],
  opts: ControlPlaneOptions = {}
): ControlPlaneReport {
  return analyze(
    { id: instanceId, status, decisions, startDateTime: endDateTime, endDateTime },
    opts
  );
}
