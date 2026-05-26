// SPDX-License-Identifier: AGPL-3.0-or-later

import type { ReviewInput } from "../types.js";

export interface ReviewLanePacket {
  instanceId: string;
  owner: string;
  cadence: string;
  reviewScope: string;
  nextAction: string;
  note: string;
}

export interface RemediationPacket {
  packetId: string;
  lane: string;
  owner: string;
  completenessScore: number;
  status: "red" | "yellow" | "green";
  blocker: string;
  launchWindowHours: number;
  decisionNote: string;
}

export const sampleReviewPayload: ReviewInput = {
  value: [
    {
      id: "instance-2026-05-01",
      reviewName: "Privileged roles Q2 closeout",
      startDateTime: "2026-05-01T00:00:00Z",
      endDateTime: "2026-05-15T00:00:00Z",
      status: "InProgress",
      decisions: [
        {
          id: "dec-1",
          principal: {
            id: "u-alice",
            displayName: "Alice Admin",
            userPrincipalName: "alice@kgtenant.example",
            type: "user"
          },
          resource: {
            id: "role-ga",
            displayName: "Global Administrator",
            type: "role",
            roleTemplateId: "62e90394-69f5-4237-9190-012177145e10"
          },
          decision: "notReviewed"
        },
        {
          id: "dec-2",
          principal: {
            id: "u-bob",
            displayName: "Bob Platform",
            userPrincipalName: "bob@kgtenant.example",
            type: "user"
          },
          resource: {
            id: "role-secadmin",
            displayName: "Security Administrator",
            type: "role",
            roleTemplateId: "194ae4cb-b126-40b2-bd5b-6091b380977d"
          },
          decision: "approve",
          reviewedDateTime: "2026-05-10T12:00:00Z"
        },
        {
          id: "dec-3",
          principal: {
            id: "u-carol",
            displayName: "Carol Helpdesk",
            userPrincipalName: "carol@kgtenant.example",
            type: "user"
          },
          resource: {
            id: "role-helpdesk",
            displayName: "Helpdesk Administrator",
            type: "role",
            roleTemplateId: "729827e3-9c14-49f7-bb1b-9608f156bbb8"
          },
          decision: "approve",
          reviewedBy: { id: "u-carol", displayName: "Carol Helpdesk" },
          reviewedDateTime: "2026-05-09T09:00:00Z"
        }
      ]
    },
    {
      id: "instance-2026-04-18",
      reviewName: "External guests and app grants",
      startDateTime: "2026-04-18T00:00:00Z",
      endDateTime: "2026-05-10T00:00:00Z",
      status: "Completed",
      decisions: [
        {
          id: "dec-4",
          principal: {
            id: "u-dave",
            displayName: "Dave Vendor",
            userPrincipalName: "dave.vendor@example.net",
            type: "user"
          },
          resource: {
            id: "group-finance",
            displayName: "Finance Reports",
            type: "group"
          },
          decision: "approve",
          reviewedBy: { id: "u-elena", displayName: "Elena Director" },
          reviewedDateTime: "2026-03-20T10:00:00Z"
        },
        {
          id: "dec-5",
          principal: {
            id: "u-farrah",
            displayName: "Farrah Guest",
            userPrincipalName: "farrah.partner@example.org",
            type: "user"
          },
          resource: {
            id: "app-powerbi",
            displayName: "Power BI Embedded Workspace",
            type: "app"
          },
          decision: "notNotified"
        }
      ]
    },
    {
      id: "instance-2026-05-07",
      reviewName: "Privileged groups and break-glass accounts",
      startDateTime: "2026-05-07T00:00:00Z",
      endDateTime: "2026-05-28T00:00:00Z",
      status: "Auto-Reviewed",
      decisions: [
        {
          id: "dec-6",
          principal: {
            id: "u-gina",
            displayName: "Gina Ops",
            userPrincipalName: "gina@kgtenant.example",
            type: "user"
          },
          resource: {
            id: "role-useradmin",
            displayName: "User Administrator",
            type: "role",
            roleTemplateId: "fe930be7-5e62-47db-91af-98c3a49a38b1"
          },
          decision: "approve",
          reviewedBy: { id: "u-harold", displayName: "Harold Reviewer" },
          reviewedDateTime: "2026-05-20T15:00:00Z",
          appliedDateTime: "2026-05-22T18:00:00Z"
        }
      ]
    }
  ]
};

export const reviewLanePackets: ReviewLanePacket[] = [
  {
    instanceId: "instance-2026-05-01",
    owner: "Entra Governance",
    cadence: "Quarterly",
    reviewScope: "Privileged roles · core tenant",
    nextAction: "Escalate open Global Admin decision and require dual-control for privileged role closeout.",
    note: "Privileged review still shows a self-review and an approval with no reviewer evidence."
  },
  {
    instanceId: "instance-2026-04-18",
    owner: "Identity Operations",
    cadence: "Monthly",
    reviewScope: "Guests + app grants",
    nextAction: "Close stale guest and app-grant decisions before the next audit packet exports.",
    note: "Guest and app-grant reviews need better notification and application proof."
  },
  {
    instanceId: "instance-2026-05-07",
    owner: "Platform Security",
    cadence: "Monthly",
    reviewScope: "Privileged groups + break glass",
    nextAction: "Validate break-glass reviewer independence and archive clean evidence for the next audit run.",
    note: "This lane is the healthiest posture, but it still needs evidence packaging."
  }
];

export const remediationPackets: RemediationPacket[] = [
  {
    packetId: "RP-11",
    lane: "Privileged roles Q2 closeout",
    owner: "Entra Governance",
    completenessScore: 52,
    status: "red",
    blocker: "Open Global Admin decision and unverified privileged approval path",
    launchWindowHours: 10,
    decisionNote: "Hold privileged closeout until dual-review proof and application evidence are attached."
  },
  {
    packetId: "RP-18",
    lane: "External guests and app grants",
    owner: "Identity Operations",
    completenessScore: 71,
    status: "yellow",
    blocker: "Stale app-grant review and not-notified guest decision",
    launchWindowHours: 26,
    decisionNote: "Clear guest notification gaps and stale application evidence before the next compliance export."
  },
  {
    packetId: "RP-24",
    lane: "Break-glass accounts",
    owner: "Platform Security",
    completenessScore: 93,
    status: "green",
    blocker: "No active blocker",
    launchWindowHours: 72,
    decisionNote: "Packet is safe for governed archive and reviewer-attestation export."
  }
];
