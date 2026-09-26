// Shared severity mapping so the Investigation table, the Severity chart,
// and the Column Risk chart all agree on what counts as CRITICAL / HIGH /
// MEDIUM. Explicitly a project-defined heuristic, not an industry standard:
// invalid values are correctness problems (critical), duplicates corrupt
// row-level counting (critical), missing values reduce usable signal
// (high), outliers may or may not be errors (medium).
export const SEVERITY = {
  invalid: { level: "CRITICAL", color: "#FB7185", weight: 3 },
  duplicates: { level: "CRITICAL", color: "#FB7185", weight: 3 },
  missing: { level: "HIGH", color: "#FBBF24", weight: 2 },
  outliers: { level: "MEDIUM", color: "#3B82F6", weight: 1 },
};

export function severityCounts(report) {
  if (!report) return [];
  const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0 };
  counts.CRITICAL += Object.keys(report.invalid).length;
  if (report.duplicates.count > 0) counts.CRITICAL += 1;
  counts.HIGH += Object.keys(report.missing).length;
  counts.MEDIUM += Object.keys(report.outliers).length;
  return [
    { name: "Critical", value: counts.CRITICAL, color: "#FB7185" },
    { name: "High", value: counts.HIGH, color: "#FBBF24" },
    { name: "Medium", value: counts.MEDIUM, color: "#3B82F6" },
  ];
}

// Project-defined "Column Risk Index" (0-100): a weighted combination of
// how much of that column is missing/invalid/outlier, plus a small flat
// nudge if the dataset has duplicates at all (duplicates aren't tied to a
// single column, so every column gets a small shared penalty rather than
// pretending one column "caused" them).
export function columnRiskIndex(report) {
  if (!report) return [];
  const rows = Math.max(report.shape.rows, 1);
  const duplicateNudge = report.duplicates.count > 0 ? Math.min((report.duplicates.count / rows) * 20, 8) : 0;

  return Object.keys(report.dtypes).map((col) => {
    const missingPct = (report.missing[col] || 0) / rows;
    const invalidPct = (report.invalid[col]?.count || 0) / rows;
    const outlierPct = (report.outliers[col]?.count || 0) / rows;
    const risk = Math.min(
      100,
      Math.round(missingPct * 100 * 0.3 + invalidPct * 100 * 1.0 + outlierPct * 100 * 0.4 + duplicateNudge)
    );
    return { name: col, value: risk };
  }).sort((a, b) => b.value - a.value);
}
