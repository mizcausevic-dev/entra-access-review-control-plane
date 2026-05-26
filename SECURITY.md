# Security Policy

`entra-access-review-control-plane` is a pure-transform library and CLI: it reads JSON access-review exports from Microsoft Graph (or synthetic data) and emits a structured findings report. No network listener, no remote fetch, no Graph token storage, no execution of user-supplied code.

The input file may contain principal identifiers (UPNs, object ids) that are sensitive in your tenant. The report includes UPNs in finding rows — be deliberate about where you store the input and the output.

## Supported versions

Only the latest tagged release is supported.

## Reporting a vulnerability

Please use GitHub Security Advisories for private disclosure:

- [Open a security advisory](https://github.com/mizcausevic-dev/entra-access-review-control-plane/security/advisories/new)

Do not file public issues for security reports.
