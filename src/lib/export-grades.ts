interface GradeRow {
  studentName: string;
  items: { title: string; type: string; maxScore: number; score: number | null; graded: boolean; isLate: boolean }[];
  totalEarned: number;
  totalPossible: number;
  percentage: number;
}

export function exportGradesToCSV(
  grades: { title: string; type: string; maxScore: number; submissions: { studentName: string; score: number | null; graded: boolean; isLate: boolean }[] }[],
  students: { id: string; name: string }[],
  classroomName: string
) {
  // Build header
  const headers = ["Student"];
  grades.forEach((g) => {
    headers.push(`${g.title} (${g.type}, /${g.maxScore})`);
  });
  headers.push("Total Earned", "Total Possible", "Percentage");

  // Build rows
  const rows: string[][] = [];
  students.forEach((student) => {
    const row: string[] = [student.name];
    let totalEarned = 0;
    let totalPossible = 0;

    grades.forEach((g) => {
      const sub = g.submissions.find((s) => s.studentName === student.name);
      if (sub && sub.graded && sub.score !== null) {
        row.push(`${sub.score}${sub.isLate ? " (Late)" : ""}`);
        totalEarned += sub.score;
        totalPossible += g.maxScore;
      } else if (sub) {
        row.push("Pending");
      } else {
        row.push("—");
      }
    });

    const pct = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;
    row.push(String(totalEarned), String(totalPossible), `${pct}%`);
    rows.push(row);
  });

  // Convert to CSV
  const escape = (val: string) => `"${val.replace(/"/g, '""')}"`;
  const csv = [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n");

  // Download
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${classroomName.replace(/\s+/g, "_")}_grades_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
