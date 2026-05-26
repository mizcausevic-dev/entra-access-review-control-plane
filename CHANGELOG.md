# Changelog

## v1.0.0-prod — 2026-05-27

Production-readiness hardening on top of v0.1-shipped.

- Verified all CI gates pass on a clean `npm ci`: lint, typecheck, coverage (98.24% statements / 85.27% branches / 96.29% functions / 98.08% lines), build, demo, smoke, `npm audit --audit-level=high` (0 vulnerabilities).
- Confirmed AGPL-3.0-or-later licensing, `SECURITY.md`, `CODE_OF_CONDUCT.md`, weekly `dependabot.yml` for `npm` + `github-actions`.
- Confirmed CI workflow runs the Node 20 + 22 matrix and the production-status surfaces (CI / License / Deploy badges + `## Production status` block) are intact in the README.
- Live operator surface running at https://entra.kineticgain.com/ via the GitHub Pages deploy rail.
- No changes to source, README content, docs, or screenshots — those remain the v0.1-shipped surface from the build lane.

## v0.1.0 - 2026-05-26

- built public operator surface for Microsoft Entra access reviews
- preserved the offline analyzer and CLI for Microsoft Graph export inspection
- added review-lane, access-risk, remediation-posture, verification, and docs routes
- added GitHub Pages deploy rail with CNAME, robots.txt, sitemap.xml, and OG metadata injection
- added README proof assets and Kinetic Gain Embedded tie-back documentation
