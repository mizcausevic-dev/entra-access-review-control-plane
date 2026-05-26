# Security Policy

`entra-access-review-control-plane` includes:

- an offline analyzer and CLI for Microsoft Graph access-review exports
- a local Express operator surface for synthetic demo rendering
- a static GitHub Pages build for the public demo

The repo does **not** require live Graph tokens or tenant credentials for the shipped public surface.

## Data handling

- Treat real Microsoft Graph review exports as sensitive tenant data.
- Principal identifiers, reviewer identifiers, and role names can all be operationally sensitive.
- The public repo ships **synthetic sample data only**.
- Do not commit live tenant exports, tokens, or screenshots containing real admin identities.

## Supported versions

Only the latest tagged release is supported.

## Reporting a vulnerability

Please use GitHub Security Advisories for private disclosure:

- [Open a security advisory](https://github.com/mizcausevic-dev/entra-access-review-control-plane/security/advisories/new)

Do not file public issues for security reports.
