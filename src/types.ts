// SPDX-License-Identifier: AGPL-3.0-or-later
//
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
  id: string;
  principal: {
    id: string;
    displayName?: string;
    userPrincipalName?: string;
    type?: "user" | "group" | "servicePrincipal";
  };
  resource: {
    id: string;
    displayName?: string;
    type?: "role" | "group" | "app";
    roleTemplateId?: string;
  };
  decision: DecisionState;
  reviewedBy?: { id: string; displayName?: string };
  reviewedDateTime?: string;
  appliedDateTime?: string;
}

export interface AccessReviewInstance {
  id: string;
  startDateTime: string;
  endDateTime: string;
  status: InstanceStatus;
  decisions: AccessReviewDecision[];
  reviewName?: string;
}

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
  decisionsByState: Record<DecisionState, number>;
  instancesByStatus: Record<InstanceStatus, number>;
  openPrivilegedDecisions: number;
  findings: Finding[];
  ok: boolean;
}

export interface ControlPlaneOptions {
  now?: string;
  overdueAfterDays?: number;
  staleAfterDays?: number;
}

export const PRIVILEGED_ROLE_TEMPLATE_IDS: ReadonlySet<string> = new Set([
  "62e90394-69f5-4237-9190-012177145e10",
  "e8611ab8-c189-46e8-94e1-60213ab1f814",
  "194ae4cb-b126-40b2-bd5b-6091b380977d",
  "f28a1f50-f6e7-4571-818b-6a12f2af6b6c",
  "29232cdf-9323-42fd-ade2-1d097af3e4de",
  "729827e3-9c14-49f7-bb1b-9608f156bbb8",
  "fe930be7-5e62-47db-91af-98c3a49a38b1",
  "966707d0-3269-4727-9be2-8c3a10f19b9d"
]);
