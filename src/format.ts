import type { ControlPlaneReport, FindingSeverity } from "./types.js";

const SEVERITY_LABEL: Record<FindingSeverity, string> = {
  high: "🔴 high",
  medium: "🟠 medium",
  low: "🟡 low",
  info: "ℹ️  info"
};

const SEVERITY_RANK: Record<FindingSeverity, number> = {
  high: 0,
  medium: 1,
  low: 2,
  info: 3
};

/** GitHub-flavored Markdown report suitable for posting in CI or to a wiki. */
export function toMarkdown(report: ControlPlaneReport): string {
  const lines: string[] = [];
  lines.push(report.ok ? `# Entra access-review control plane ✅` : `# Entra access-review control plane ❌`);
  lines.push(``);
  lines.push(`Generated: \`${report.generatedAt}\``);
  lines.push(``);
  lines.push(`## Overview`);
  lines.push(``);
  lines.push(
    `- Instances: **${report.instances}** · Decisions: **${report.decisions}** · Open privileged decisions: **${report.openPrivilegedDecisions}**`
  );
  lines.push(``);
  lines.push(`## Decisions by state`);
  lines.push(``);
  lines.push(`| approve | deny | dontKnow | notReviewed | notNotified |`);
  lines.push(`|---:|---:|---:|---:|---:|`);
  lines.push(
    `| ${report.decisionsByState.approve} | ${report.decisionsByState.deny} | ${report.decisionsByState.dontKnow} | ${report.decisionsByState.notReviewed} | ${report.decisionsByState.notNotified} |`
  );

  const ranked = [...report.findings].sort(
    (a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]
  );

  if (ranked.length > 0) {
    lines.push(``);
    lines.push(`## Findings (${ranked.length})`);
    lines.push(``);
    lines.push(`| severity | code | principal | resource | message |`);
    lines.push(`|---|---|---|---|---|`);
    for (const f of ranked) {
      lines.push(
        `| ${SEVERITY_LABEL[f.severity]} | \`${f.code}\` | ${f.principal ?? "—"} | ${f.resource ?? "—"} | ${f.message} |`
      );
    }
  } else {
    lines.push(``);
    lines.push(`No findings.`);
  }

  return lines.join("\n");
}

/** One-line summary suitable for CI logs. */
export function toSummary(report: ControlPlaneReport): string {
  const counts: Record<FindingSeverity, number> = { high: 0, medium: 0, low: 0, info: 0 };
  for (const f of report.findings) counts[f.severity] += 1;
  return `${report.instances} instance${report.instances === 1 ? "" : "s"} · ${report.decisions} decision${report.decisions === 1 ? "" : "s"} · ${counts.high} high · ${counts.medium} medium · ${counts.info} info (${report.ok ? "ok" : "fail"})`;
}
