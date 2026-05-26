// Operator control-plane for Microsoft Entra (Azure AD) access reviews.
//
// Input shape: Microsoft Graph access-reviews API
//   GET /identityGovernance/accessReviews/definitions/{id}/instances/{instanceId}/decisions
//   GET /identityGovernance/accessReviews/definitions/{id}/instances
// Reference: https://learn.microsoft.com/en-us/graph/api/resources/accessreviewinstancedecisionitem

export type DecisionState =
  | "approve"
  | "deny"
  | "dontKnow"
  | "notReviewed"
  | "notNotified";

export type InstanceStatus =
  | "NotStarted"
  | "Initializing"
  | "InProgress"
  | "Completing"
  | "Completed"
  | "Auto-Reviewing"
  | "Auto-Reviewed";

export interface AccessReviewDecision {
  /** Microsoft Graph decision item id. */
  id: string;
  /** Principal whose access is under review (user or group). */
  principal: {
    id: string;
    displayName?: string;
    userPrincipalName?: string;
    type?: "user" | "group" | "servicePrincipal";
  };
  /** Resource whose access is reviewed (role, group, app). */
  resource: {
    id: string;
    displayName?: string;
    type?: "role" | "group" | "app";
    /** When `type === "role"`, this is the Azure AD role template id (e.g. Global Administrator). */
    roleTemplateId?: string;
  };
  decision: DecisionState;
  /** "Reviewer" or "ReviewerName" who supplied the decision. */
  reviewedBy?: { id: string; displayName?: string };
  /** ISO timestamps. */
  reviewedDateTime?: string;
  appliedDateTime?: string;
}

export interface AccessReviewInstance {
  id: string;
  /** When the instance opened. */
  startDateTime: string;
  /** When the instance is/was due to close. */
  endDateTime: string;
  status: InstanceStatus;
  decisions: AccessReviewDecision[];
  /** Free-form review name from the definition. */
  reviewName?: string;
}

/** Composite shape the CLI reads — either one instance or many. */
export type ReviewInput =
  | AccessReviewInstance
  | AccessReviewInstance[]
  | { value: AccessReviewInstance[] };

export type FindingSeverity = "high" | "medium" | "low" | "info";

export type FindingCode =
  | "stale-decision"
  | "decision-overdue"
  | "high-risk-principal"
  | "privileged-role-auto-approved"
  | "reviewer-self-review"
  | "instance-overdue";

export interface Finding {
  code: FindingCode;
  severity: FindingSeverity;
  message: string;
  instanceId: string;
  decisionId?: string;
  principal?: string;
  resource?: string;
}

export interface ControlPlaneReport {
  generatedAt: string;
  instances: number;
  decisions: number;
  /** Counts per decision state across all instances. */
  decisionsByState: Record<DecisionState, number>;
  /** Counts per instance status. */
  instancesByStatus: Record<InstanceStatus, number>;
  /** Privileged-role decisions still open at scan time. */
  openPrivilegedDecisions: number;
  findings: Finding[];
  /** True iff no `high` severity findings. */
  ok: boolean;
}

export interface ControlPlaneOptions {
  /** "Now" used for age/overdue math (ISO). Defaults to system clock. */
  now?: string;
  /** Decisions whose instance closed N days ago without a decision = `decision-overdue`. Default 14. */
  overdueAfterDays?: number;
  /** Decisions reviewed N+ days ago that were never applied = `stale-decision`. Default 30. */
  staleAfterDays?: number;
}

/**
 * Azure AD built-in role template ids treated as "privileged" for this control plane.
 * Source: Microsoft Entra built-in roles documentation. We hard-code the high-blast-radius
 * roles only — Global Admin, Privileged Role Admin, Security Admin, etc.
 */
export const PRIVILEGED_ROLE_TEMPLATE_IDS: ReadonlySet<string> = new Set([
  "62e90394-69f5-4237-9190-012177145e10", // Global Administrator
  "e8611ab8-c189-46e8-94e1-60213ab1f814", // Privileged Role Administrator
  "194ae4cb-b126-40b2-bd5b-6091b380977d", // Security Administrator
  "f28a1f50-f6e7-4571-818b-6a12f2af6b6c", // SharePoint Administrator
  "29232cdf-9323-42fd-ade2-1d097af3e4de", // Exchange Administrator
  "729827e3-9c14-49f7-bb1b-9608f156bbb8", // Helpdesk Administrator (token reset risk)
  "fe930be7-5e62-47db-91af-98c3a49a38b1", // User Administrator
  "966707d0-3269-4727-9be2-8c3a10f19b9d"  // Password Administrator
]);
