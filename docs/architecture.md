# Architecture

`entra-access-review-control-plane` has two layers:

1. an offline analyzer and CLI for Microsoft Graph access-review exports
2. a public operator dashboard that turns that analysis into review-lane, risk, and remediation posture pages

The public pages are synthetic and static-safe. No live tenant secrets, Graph tokens, or customer identifiers are required for the demo surface.
