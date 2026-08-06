import { useState } from "react";
import { Plus, Trash2, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Course {
  name: string;
  credits: number;
  grade: string;
}

interface Semester {
  name: string;
  courses: Course[];
}

const gradePoints: Record<string, number> = {
  "A+": 4.00,
  "A": 3.75,
  "A-": 3.50,
  "B+": 3.25,
  "B": 3.00,
  "B-": 2.75,
  "C+": 2.50,
  "C": 2.25,
  "D": 2.00,
  "F": 0.00,
};

const gradeInfo: { grade: string; points: number; range: string; desc: string }[] = [
  { grade: "A+", points: 4.00, range: "80% - 100%", desc: "Outstanding" },
  { grade: "A", points: 3.75, range: "75% - 79%", desc: "Excellent" },
  { grade: "A-", points: 3.50, range: "70% - 74%", desc: "Very Good" },
  { grade: "B+", points: 3.25, range: "65% - 69%", desc: "Good" },
  { grade: "B", points: 3.00, range: "60% - 64%", desc: "Above Average" },
  { grade: "B-", points: 2.75, range: "55% - 59%", desc: "Average" },
  { grade: "C+", points: 2.50, range: "50% - 54%", desc: "Below Average" },
  { grade: "C", points: 2.25, range: "45% - 49%", desc: "Pass" },
  { grade: "D", points: 2.00, range: "40% - 44%", desc: "Marginal Pass" },
  { grade: "F", points: 0.00, range: "Below 40%", desc: "Fail" },
];

const defaultCourse = (): Course => ({ name: "", credits: 3, grade: "A" });

const defaultSemester = (num: number): Semester => ({
  name: `Semester ${num}`,
  courses: [defaultCourse(), defaultCourse(), defaultCourse()],
});

function calculateSemesterGPA(courses: Course[]) {
  let totalPoints = 0;
  let totalCredits = 0;
  courses.forEach((c) => {
    const gp = gradePoints[c.grade] ?? 0;
    totalPoints += gp * c.credits;
    totalCredits += c.credits;
  });
  return totalCredits > 0 ? totalPoints / totalCredits : 0;
}

export default function CGPACalculator() {
  const [cgpaMode, setCgpaMode] = useState<"single" | "semester">("single");

  // Single semester
  const [courses, setCourses] = useState<Course[]>([
    defaultCourse(),
    defaultCourse(),
    defaultCourse(),
  ]);

  // Multi-semester
  const [semesters, setSemesters] = useState<Semester[]>(() =>
    Array.from({ length: 8 }, (_, i) => defaultSemester(i + 1))
  );

  const singleCGPA = calculateSemesterGPA(courses);

  const addSemester = () => {
    setSemesters([...semesters, defaultSemester(semesters.length + 1)]);
  };

  const removeSemester = (si: number) => {
    if (semesters.length <= 1) return;
    setSemesters(semesters.filter((_, i) => i !== si));
  };

  const overallCGPA = (() => {
    let totalPoints = 0;
    let totalCredits = 0;
    semesters.forEach((sem) => {
      sem.courses.forEach((c) => {
        const gp = gradePoints[c.grade] ?? 0;
        totalPoints += gp * c.credits;
        totalCredits += c.credits;
      });
    });
    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  })();

  // Single semester handlers
  const updateCourse = (i: number, field: keyof Course, value: string | number) => {
    const updated = [...courses];
    updated[i] = { ...updated[i], [field]: value };
    setCourses(updated);
  };

  // Multi-semester handlers
  const updateSemesterCourse = (si: number, ci: number, field: keyof Course, value: string | number) => {
    const updated = [...semesters];
    const courses = [...updated[si].courses];
    courses[ci] = { ...courses[ci], [field]: value };
    updated[si] = { ...updated[si], courses };
    setSemesters(updated);
  };

  const addSemesterCourse = (si: number) => {
    const updated = [...semesters];
    updated[si] = { ...updated[si], courses: [...updated[si].courses, defaultCourse()] };
    setSemesters(updated);
  };

  const removeSemesterCourse = (si: number, ci: number) => {
    const updated = [...semesters];
    updated[si] = { ...updated[si], courses: updated[si].courses.filter((_, i) => i !== ci) };
    setSemesters(updated);
  };

  const CourseRow = ({
    course,
    onUpdate,
    onRemove,
  }: {
    course: Course;
    onUpdate: (field: keyof Course, value: string | number) => void;
    onRemove: () => void;
  }) => (
    <div className="flex items-end gap-2 p-3 bg-muted/50 rounded-lg">
      <div className="flex-1">
        <Label className="text-xs text-muted-foreground">Course Name</Label>
        <Input
          value={course.name}
          onChange={(e) => onUpdate("name", e.target.value)}
          placeholder="Course name"
          className="mt-1"
        />
      </div>
      <div className="w-20">
        <Label className="text-xs text-muted-foreground">Credits</Label>
        <Input
          type="number"
          min="1"
          max="6"
          value={course.credits}
          onChange={(e) => onUpdate("credits", parseInt(e.target.value) || 1)}
          className="mt-1"
        />
      </div>
      <div className="w-20">
        <Label className="text-xs text-muted-foreground">Grade</Label>
        <select
          value={course.grade}
          onChange={(e) => onUpdate("grade", e.target.value)}
          className="mt-1 w-full h-10 px-2 rounded-md border border-input bg-background text-sm"
        >
          {Object.keys(gradePoints).map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>
      <Button variant="ghost" size="icon" onClick={onRemove} className="text-muted-foreground hover:text-destructive shrink-0">
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Mode Tabs */}
      <Tabs value={cgpaMode} onValueChange={(v) => setCgpaMode(v as "single" | "semester")}>
        <TabsList className="grid w-full max-w-sm grid-cols-2">
          <TabsTrigger value="single">Single Semester</TabsTrigger>
          <TabsTrigger value="semester">Semester-wise</TabsTrigger>
        </TabsList>

        {/* Single Semester */}
        <TabsContent value="single" className="mt-4 space-y-4">
          <Card className="gradient-calc text-white">
            <CardContent className="py-8 text-center">
              <p className="text-sm opacity-80 mb-2">Your GPA</p>
              <p className="text-6xl font-bold font-mono-display">{singleCGPA.toFixed(2)}</p>
              <p className="text-sm opacity-80 mt-2">
                Based on {courses.length} course{courses.length !== 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Courses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {courses.map((course, i) => (
                <CourseRow
                  key={i}
                  course={course}
                  onUpdate={(field, value) => updateCourse(i, field, value)}
                  onRemove={() => setCourses(courses.filter((_, idx) => idx !== i))}
                />
              ))}
              <Button onClick={() => setCourses([...courses, defaultCourse()])} variant="outline" className="w-full mt-4">
                <Plus className="w-4 h-4 mr-2" /> Add Course
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Semester-wise */}
        <TabsContent value="semester" className="mt-4 space-y-4">
          <Card className="gradient-calc text-white">
            <CardContent className="py-8 text-center">
              <p className="text-sm opacity-80 mb-2">Overall CGPA</p>
              <p className="text-6xl font-bold font-mono-display">{overallCGPA.toFixed(2)}</p>
              <p className="text-sm opacity-80 mt-2">
                {semesters.length} semester{semesters.length !== 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>

          {/* Quick Setup */}
          <Card>
            <CardContent className="pt-6">
              <Label className="text-sm font-medium">Quick Setup (Program Duration)</Label>
              <div className="flex gap-2 mt-2">
                {[2, 3, 4].map((y) => (
                  <Button
                    key={y}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSemesters(Array.from({ length: y * 2 }, (_, i) => defaultSemester(i + 1)));
                    }}
                  >
                    {y} Years ({y * 2} Sem)
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Semester Cards */}
          {semesters.map((sem, si) => {
            const semGPA = calculateSemesterGPA(sem.courses);
            return (
              <Card key={si}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-primary" />
                      {sem.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-primary">GPA: {semGPA.toFixed(2)}</span>
                      <Button variant="ghost" size="icon" onClick={() => removeSemester(si)} className="h-7 w-7 text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {sem.courses.map((course, ci) => (
                    <CourseRow
                      key={ci}
                      course={course}
                      onUpdate={(field, value) => updateSemesterCourse(si, ci, field, value)}
                      onRemove={() => removeSemesterCourse(si, ci)}
                    />
                  ))}
                  <Button onClick={() => addSemesterCourse(si)} variant="outline" size="sm" className="w-full mt-2">
                    <Plus className="w-3 h-3 mr-1" /> Add Course
                  </Button>
                </CardContent>
              </Card>
            );
          })}
          <Button onClick={addSemester} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" /> Add Semester
          </Button>
        </TabsContent>
      </Tabs>

      {/* Grade Reference Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-muted-foreground">Grade Point Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary text-primary-foreground">
                  <th className="text-left p-2 rounded-tl-md">Letter Grade</th>
                  <th className="text-left p-2">Grade Point</th>
                  <th className="text-left p-2">Percentage Range</th>
                  <th className="text-left p-2 rounded-tr-md">Description</th>
                </tr>
              </thead>
              <tbody>
                {gradeInfo.map((g, i) => (
                  <tr key={g.grade} className={i % 2 === 0 ? "bg-muted/30" : "bg-muted/60"}>
                    <td className="p-2 font-semibold">{g.grade}</td>
                    <td className="p-2">{g.points.toFixed(2)}</td>
                    <td className="p-2">{g.range}</td>
                    <td className="p-2">{g.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
