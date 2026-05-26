# Changelog

## v0.1.0 — 2026-05-27

- Initial release: operator control plane for Microsoft Entra (Azure AD) access reviews.
- Reads Microsoft Graph access-reviews API JSON exports (single instance, array, or `{ "value": [ ... ] }` envelope).
- 6 finding codes: `privileged-role-auto-approved`, `reviewer-self-review`, `instance-overdue`, `decision-overdue`, `stale-decision`, `high-risk-principal`.
- Bundled `PRIVILEGED_ROLE_TEMPLATE_IDS` set covers Microsoft's high-blast-radius built-in roles (Global Admin, Privileged Role Admin, Security Admin, SharePoint Admin, Exchange Admin, Helpdesk Admin, User Admin, Password Admin).
- Library API: `analyze(input, opts)` → `ControlPlaneReport`; `toMarkdown(report)` + `toSummary(report)` formatters.
- CLI: `entra-access-review <export.json>` with `--format json|markdown|summary`, `--now <iso>`, `--overdue-after-days N`, `--stale-after-days N`, `--fail-on-high`, `--out FILE`.
- Opens the Cloud Identity / Microsoft 365 lane (Wave 11).
- Node 20/22 CI (lint, typecheck, coverage, build, demo, `npm audit`), AGPL-3.0-or-later, Dependabot.
