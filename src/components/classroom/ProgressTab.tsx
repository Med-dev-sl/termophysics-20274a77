import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, CheckCircle2, Clock, Download, TrendingUp, Users } from "lucide-react";
import { exportGradesToCSV } from "@/lib/export-grades";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { AnimatedCounter, AnimatedProgressBar } from "@/components/ui/animated-charts";
import { ProgressSkeleton } from "@/components/ui/skeleton-loaders";

interface ProgressTabProps {
  classroomId: string;
  isTeacher: boolean;
}

interface AssignmentGrade {
  id: string;
  title: string;
  max_score: number;
  due_date: string | null;
  type: "assignment" | "quiz";
  submissions: {
    student_id: string;
    student_name: string;
    score: number | null;
    graded: boolean;
    is_late: boolean;
  }[];
}

interface StudentSummary {
  student_id: string;
  student_name: string;
  total_earned: number;
  total_possible: number;
  graded_count: number;
  submitted_count: number;
  total_items: number;
  percentage: number;
}

export function ProgressTab({ classroomId, isTeacher, classroomName }: ProgressTabProps & { classroomName?: string }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [grades, setGrades] = useState<AssignmentGrade[]>([]);
  const [students, setStudents] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<string>("all");

  useEffect(() => {
    if (user) fetchProgress();
  }, [user, classroomId]);

  const fetchProgress = async () => {
    setLoading(true);
    const allGrades: AssignmentGrade[] = [];

    const { data: assignments } = await supabase
      .from("assignments")
      .select("id, title, max_score, due_date")
      .eq("classroom_id", classroomId)
      .order("created_at", { ascending: true });

    if (assignments) {
      for (const a of assignments) {
        const { data: subs } = await supabase
          .from("assignment_submissions")
          .select("student_id, score, graded_at, is_late, profiles!assignment_submissions_profiles_fkey(display_name)")
          .eq("assignment_id", a.id);

        allGrades.push({
          id: a.id, title: a.title, max_score: a.max_score, due_date: a.due_date, type: "assignment",
          submissions: (subs || []).map((s: any) => ({
            student_id: s.student_id, student_name: s.profiles?.display_name || "Unknown",
            score: s.score, graded: !!s.graded_at, is_late: s.is_late,
          })),
        });
      }
    }

    const { data: quizzes } = await supabase
      .from("quizzes")
      .select("id, title, max_score, due_date")
      .eq("classroom_id", classroomId)
      .order("created_at", { ascending: true });

    if (quizzes) {
      for (const q of quizzes) {
        const { data: subs } = await supabase
          .from("quiz_submissions")
          .select("student_id, total_score, graded_at, is_late, profiles!quiz_submissions_profiles_fkey(display_name)")
          .eq("quiz_id", q.id);

        allGrades.push({
          id: q.id, title: q.title, max_score: q.max_score, due_date: q.due_date, type: "quiz",
          submissions: (subs || []).map((s: any) => ({
            student_id: s.student_id, student_name: s.profiles?.display_name || "Unknown",
            score: s.total_score, graded: !!s.graded_at, is_late: s.is_late,
          })),
        });
      }
    }

    if (isTeacher) {
      const { data: enrollments } = await supabase
        .from("classroom_enrollments")
        .select("student_id, profiles!classroom_enrollments_profiles_fkey(display_name)")
        .eq("classroom_id", classroomId);

      setStudents((enrollments || []).map((e: any) => ({ id: e.student_id, name: e.profiles?.display_name || "Unknown" })));
    } else if (user) {
      setStudents([{ id: user.id, name: "You" }]);
    }

    setGrades(allGrades);
    setLoading(false);
  };

  const studentSummaries = useMemo<StudentSummary[]>(() => {
    const filteredStudents = selectedStudent === "all" ? students : students.filter((s) => s.id === selectedStudent);
    return filteredStudents.map((student) => {
      let totalEarned = 0, totalPossible = 0, gradedCount = 0, submittedCount = 0;
      grades.forEach((g) => {
        const submission = g.submissions.find((s) => s.student_id === student.id);
        if (submission) {
          submittedCount++;
          if (submission.graded && submission.score !== null) {
            gradedCount++;
            totalEarned += submission.score;
            totalPossible += g.max_score;
          }
        }
      });
      return {
        student_id: student.id, student_name: student.name, total_earned: totalEarned,
        total_possible: totalPossible, graded_count: gradedCount, submitted_count: submittedCount,
        total_items: grades.length, percentage: totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0,
      };
    });
  }, [students, grades, selectedStudent]);

  const classAverage = useMemo(() => {
    if (studentSummaries.length === 0) return 0;
    return Math.round(studentSummaries.reduce((sum, s) => sum + s.percentage, 0) / studentSummaries.length);
  }, [studentSummaries]);

  const gradedTotal = useMemo(() => grades.reduce((c, g) => c + g.submissions.filter((s) => s.graded).length, 0), [grades]);

  if (loading) return <ProgressSkeleton />;

  if (grades.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <Card className="termo-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
              <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            </motion.div>
            <p className="text-muted-foreground text-center">
              No assignments or quizzes yet. Progress will appear here once graded work is available.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const getScoreColor = (pct: number) => {
    if (pct >= 80) return "text-green-600 dark:text-green-400";
    if (pct >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getBarColor = (pct: number) => {
    if (pct >= 80) return "bg-green-500";
    if (pct >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const handleExportCSV = () => {
    const exportData = grades.map((g) => ({
      title: g.title, type: g.type, maxScore: g.max_score,
      submissions: g.submissions.map((s) => ({ studentName: s.student_name, score: s.score, graded: s.graded, isLate: s.is_late })),
    }));
    exportGradesToCSV(exportData, students, classroomName || "classroom");
    toast({ title: "Grades exported", description: "CSV file downloaded successfully." });
  };

  const summaryCards = [
    { icon: BarChart3, label: isTeacher ? "Class Average" : "Overall Grade", value: classAverage, suffix: "%", color: "bg-primary/10", iconColor: "text-primary" },
    { icon: TrendingUp, label: "Total Items", value: grades.length, suffix: "", color: "bg-accent/10", iconColor: "text-accent" },
    { icon: CheckCircle2, label: "Graded", value: gradedTotal, suffix: "", color: "bg-green-500/10", iconColor: "text-green-500" },
    { icon: Users, label: "Students", value: students.length, suffix: "", color: "bg-muted", iconColor: "text-muted-foreground" },
  ];

  return (
    <div className="space-y-6">
      {isTeacher && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex justify-end">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
              <Download className="h-4 w-4" /> Export Grades (CSV)
            </Button>
          </motion.div>
        </motion.div>
      )}

      {/* Animated Summary Cards */}
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card, i) => (
          <motion.div key={card.label} variants={staggerItem}>
            <Card className="overflow-hidden">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <motion.div
                    className={`p-2 rounded-lg ${card.color}`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                  </motion.div>
                  <div>
                    <p className="text-xs text-muted-foreground">{card.label}</p>
                    <p className={`text-2xl font-bold ${i === 0 ? getScoreColor(classAverage) : ""}`}>
                      <AnimatedCounter value={card.value} suffix={card.suffix} />
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Student filter */}
      {isTeacher && students.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Filter by student:</span>
          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="All students" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Students</SelectItem>
              {students.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </motion.div>
      )}

      {/* Student Summary Cards with animated progress */}
      {isTeacher && selectedStudent === "all" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-3">
          <h3 className="text-lg font-semibold">Student Overview</h3>
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {studentSummaries.map((s, i) => (
              <motion.div key={s.student_id} variants={staggerItem}>
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="pt-4 pb-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm truncate">{s.student_name}</span>
                      <span className={`text-lg font-bold ${getScoreColor(s.percentage)}`}>
                        <AnimatedCounter value={s.percentage} suffix="%" duration={1} />
                      </span>
                    </div>
                    <AnimatedProgressBar
                      value={s.percentage}
                      barClassName={getBarColor(s.percentage)}
                      delay={i * 0.1}
                    />
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span>{s.submitted_count}/{s.total_items} submitted</span>
                      <span>•</span>
                      <span>{s.graded_count} graded</span>
                      <span>•</span>
                      <span>{s.total_earned}/{s.total_possible} pts</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* Animated Grades Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Detailed Grades</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[160px]">Item</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Max Score</TableHead>
                  {studentSummaries.map((s) => (
                    <TableHead key={s.student_id} className="text-center min-w-[100px]">{s.student_name}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {grades.map((g, rowIdx) => (
                  <motion.tr
                    key={g.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + rowIdx * 0.05, duration: 0.3 }}
                    className="border-b border-border"
                  >
                    <TableCell className="font-medium">{g.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs capitalize">{g.type}</Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">{g.max_score}</TableCell>
                    {studentSummaries.map((student) => {
                      const sub = g.submissions.find((s) => s.student_id === student.student_id);
                      return (
                        <TableCell key={student.student_id} className="text-center">
                          {sub ? (
                            sub.graded && sub.score !== null ? (
                              <div className="flex flex-col items-center gap-0.5">
                                <motion.span
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: 0.6 + rowIdx * 0.05, type: "spring", stiffness: 300 }}
                                  className={`font-semibold ${getScoreColor((sub.score / g.max_score) * 100)}`}
                                >
                                  {sub.score}
                                </motion.span>
                                {sub.is_late && (
                                  <Badge variant="destructive" className="text-[10px] px-1 py-0">Late</Badge>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span className="text-xs">Pending</span>
                              </div>
                            )
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      );
                    })}
                  </motion.tr>
                ))}
                {/* Totals row */}
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 + grades.length * 0.05 }}
                  className="bg-muted/50 font-semibold border-b border-border"
                >
                  <TableCell colSpan={2}>Total</TableCell>
                  <TableCell className="text-right">{grades.reduce((sum, g) => sum + g.max_score, 0)}</TableCell>
                  {studentSummaries.map((s) => (
                    <TableCell key={s.student_id} className="text-center">
                      <span className={getScoreColor(s.percentage)}>
                        <AnimatedCounter value={s.total_earned} /> (<AnimatedCounter value={s.percentage} suffix="%" />)
                      </span>
                    </TableCell>
                  ))}
                </motion.tr>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
