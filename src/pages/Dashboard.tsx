import { Link } from "react-router-dom";
import { FileText, Timer, CheckSquare, Calculator, ArrowRight, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const modules = [
  {
    title: "Notes",
    description: "Capture your thoughts, ideas, and important information",
    icon: FileText,
    href: "/notes",
    color: "notes",
    gradient: "gradient-notes",
    stats: { label: "Notes", value: "12" },
  },
  {
    title: "Timer",
    description: "Stay focused with Pomodoro, stopwatch, and countdown timers",
    icon: Timer,
    href: "/timer",
    color: "timer",
    gradient: "gradient-timer",
    stats: { label: "Focus sessions", value: "24" },
  },
  {
    title: "Tasks",
    description: "Organize and track your daily tasks and goals",
    icon: CheckSquare,
    href: "/tasks",
    color: "tasks",
    gradient: "gradient-tasks",
    stats: { label: "Completed", value: "48" },
  },
  {
    title: "Calculator",
    description: "Basic, scientific, and CGPA calculator all in one place",
    icon: Calculator,
    href: "/calculator",
    color: "calc",
    gradient: "gradient-calc",
    stats: { label: "Calculations", value: "156" },
  },
];

const colorClasses = {
  notes: {
    icon: "text-notes",
    bg: "bg-notes-bg",
    border: "border-notes/20",
    hover: "group-hover:border-notes/40",
  },
  timer: {
    icon: "text-timer",
    bg: "bg-timer-bg",
    border: "border-timer/20",
    hover: "group-hover:border-timer/40",
  },
  tasks: {
    icon: "text-tasks",
    bg: "bg-tasks-bg",
    border: "border-tasks/20",
    hover: "group-hover:border-tasks/40",
  },
  calc: {
    icon: "text-calc",
    bg: "bg-calc-bg",
    border: "border-calc/20",
    hover: "group-hover:border-calc/40",
  },
};

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl gradient-hero p-8 lg:p-12">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-accent/20">
              <Zap className="w-6 h-6 text-accent" />
            </div>
            <span className="text-sm font-medium text-accent uppercase tracking-wider">
              TaskCrafter
            </span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">
            Welcome back!
          </h1>
          <p className="text-lg text-white/70 max-w-xl">
            Your all-in-one productivity suite. Take notes, track time, manage tasks, 
            and calculate anything — all in one beautiful place.
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-accent/5 rounded-full blur-2xl" />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {modules.map((module) => {
          const colors = colorClasses[module.color as keyof typeof colorClasses];
          return (
            <Card key={module.title} className={cn("glass", colors.border)}>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", colors.bg)}>
                    <module.icon className={cn("w-4 h-4", colors.icon)} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{module.stats.value}</p>
                    <p className="text-xs text-muted-foreground">{module.stats.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Module Cards */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Your Tools</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {modules.map((module) => {
            const colors = colorClasses[module.color as keyof typeof colorClasses];
            return (
              <Link key={module.title} to={module.href} className="group">
                <Card className={cn(
                  "h-full transition-all duration-300 hover:shadow-lg",
                  colors.border,
                  colors.hover
                )}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className={cn("p-3 rounded-xl", colors.bg)}>
                        <module.icon className={cn("w-6 h-6", colors.icon)} />
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </div>
                    <CardTitle className="mt-4">{module.title}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className={cn("h-1.5 w-full rounded-full overflow-hidden", colors.bg)}>
                      <div 
                        className={cn("h-full rounded-full", module.gradient)}
                        style={{ width: `${Math.random() * 50 + 30}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
