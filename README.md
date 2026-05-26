# entra-access-review-control-plane

Operator control plane for **Microsoft Entra (Azure AD)** access reviews. Reads [Microsoft Graph access-reviews API](https://learn.microsoft.com/en-us/graph/api/resources/accessreviewinstancedecisionitem) JSON exports and surfaces the things that hurt an audit:

- 🔴 **Privileged-role auto-approvals** — approve with no recorded reviewer on Global Admin / Privileged Role Admin / Security Admin / etc.
- 🔴 **Self-reviews on privileged roles** — reviewer id equals principal id on a Global Admin–class role.
- 🔴 **Instance overdue** — instance is past its `endDateTime` by more than the configured grace window and still `InProgress`.
- 🟠 **Decision overdue** — principal-level decision still `notReviewed` / `notNotified` after the instance closed.
- 🟠 **Stale decision** — `reviewedDateTime` set, but `appliedDateTime` never set, > N days later.
- ℹ️  **High-risk-principal** — every privileged-role decision is surfaced for the dashboard.

> Status: v0.1.0 — Node 20/22 supported, library + CLI. Cloud Identity lane (Wave 11).

## CLI

```
npx entra-access-review <export.json>
    [--format json|markdown|summary]
    [--now <iso>]
    [--overdue-after-days 14]
    [--stale-after-days 30]
    [--fail-on-high]
    [--out FILE]
```

Input is any of:
- A single `accessReviewInstance` object
- An array of instances
- A standard Microsoft Graph collection envelope: `{ "value": [ ... ] }`

Exit code:
- `0` — no high findings (or `--fail-on-high` not set)
- `1` — high finding present AND `--fail-on-high` set
- `2` — usage / I/O error

## Capturing the input

You can capture the JSON the CLI expects with the Graph CLI / REST. Example using `az rest`:

```bash
az rest --method GET \
  --uri "https://graph.microsoft.com/v1.0/identityGovernance/accessReviews/definitions/{definitionId}/instances?\$expand=decisions" \
  --headers "ConsistencyLevel=eventual" \
  > reviews.json
```

(no credentials are stored in this repo; the tool runs offline against the captured JSON.)

## Library

```ts
import { analyze, toMarkdown } from "entra-access-review-control-plane";

const report = analyze(payload, {
  overdueAfterDays: 14,
  staleAfterDays: 30
});

if (!report.ok) {
  console.error(`${report.findings.filter(f => f.severity === "high").length} high findings`);
}
console.log(toMarkdown(report));
```

## Privileged role coverage

The bundled `PRIVILEGED_ROLE_TEMPLATE_IDS` set covers Microsoft's high-blast-radius built-in role template ids — Global Admin, Privileged Role Admin, Security Admin, SharePoint Admin, Exchange Admin, Helpdesk Admin (password reset surface), User Admin, Password Admin. Extend it for your tenant's custom directory roles.

## Develop

```
npm install
npm run lint && npm run typecheck && npm run coverage && npm run build
npm run demo
```

## License

[AGPL-3.0-or-later](LICENSE)
