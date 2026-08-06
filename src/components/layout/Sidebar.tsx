import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  Timer, 
  CheckSquare, 
  Calculator,
  Moon,
  Receipt,
  Zap,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Notes", href: "/notes", icon: FileText, color: "notes" },
  { name: "Timer", href: "/timer", icon: Timer, color: "timer" },
  { name: "Tasks", href: "/tasks", icon: CheckSquare, color: "tasks" },
  { name: "Calculator", href: "/calculator", icon: Calculator, color: "calc" },
  { name: "Salah", href: "/salah", icon: Moon, color: "salah" },
  { name: "Invoice", href: "/invoice", icon: Receipt, color: "invoice" },
];

const colorClasses = {
  notes: "text-notes group-hover:text-notes",
  timer: "text-timer group-hover:text-timer",
  tasks: "text-tasks group-hover:text-tasks",
  calc: "text-calc group-hover:text-calc",
  salah: "text-emerald-500 group-hover:text-emerald-500",
  invoice: "text-amber-500 group-hover:text-amber-500",
};

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300 ease-in-out flex flex-col",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center h-16 px-4 border-b border-sidebar-border",
        collapsed ? "justify-center" : "gap-3"
      )}>
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-orange-400 shadow-glow">
          <Zap className="w-5 h-5 text-accent-foreground" />
        </div>
        {!collapsed && (
          <span className="text-xl font-bold text-sidebar-foreground">
            TaskForge
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                collapsed && "justify-center px-2",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon 
                  className={cn(
                    "w-5 h-5 shrink-0 transition-colors",
                    item.color && !isActive ? colorClasses[item.color as keyof typeof colorClasses] : ""
                  )} 
                />
                {!collapsed && <span className="font-medium">{item.name}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse Button */}
      <div className="p-3 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "w-full text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
            collapsed && "px-0"
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Collapse
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
