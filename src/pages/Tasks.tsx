import { useState } from "react";
import { Plus, CheckSquare, Circle, CheckCircle2, Trash2, Calendar, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  dueDate?: string;
  createdAt: Date;
}

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Complete project proposal",
    completed: false,
    priority: "high",
    dueDate: "2026-02-05",
    createdAt: new Date(),
  },
  {
    id: "2",
    title: "Review team feedback",
    completed: false,
    priority: "medium",
    dueDate: "2026-02-04",
    createdAt: new Date(),
  },
  {
    id: "3",
    title: "Schedule weekly meeting",
    completed: true,
    priority: "low",
    createdAt: new Date(),
  },
  {
    id: "4",
    title: "Update documentation",
    completed: false,
    priority: "medium",
    dueDate: "2026-02-06",
    createdAt: new Date(),
  },
];

const priorityColors = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-timer-bg text-timer",
  high: "bg-destructive/10 text-destructive",
};

const priorityIcons = {
  low: "text-muted-foreground",
  medium: "text-timer",
  high: "text-destructive",
};

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high">("medium");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    
    const task: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      completed: false,
      priority: newTaskPriority,
      dueDate: newTaskDueDate || undefined,
      createdAt: new Date(),
    };
    
    setTasks([task, ...tasks]);
    setNewTaskTitle("");
    setNewTaskDueDate("");
    setNewTaskPriority("medium");
  };

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  const activeCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  const formatDueDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const isOverdue = (dateStr: string) => {
    return new Date(dateStr) < new Date(new Date().toDateString());
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-xl bg-tasks-bg">
              <CheckSquare className="w-6 h-6 text-tasks" />
            </div>
            Tasks
          </h1>
          <p className="text-muted-foreground mt-1">Organize and track your daily tasks</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 max-w-md">
        <Card className="text-center">
          <CardContent className="pt-4 pb-3">
            <p className="text-2xl font-bold">{tasks.length}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-4 pb-3">
            <p className="text-2xl font-bold text-timer">{activeCount}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-4 pb-3">
            <p className="text-2xl font-bold text-tasks">{completedCount}</p>
            <p className="text-xs text-muted-foreground">Done</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Task */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Add a new task..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addTask()}
              className="flex-1"
            />
            <div className="flex gap-2">
              <Select value={newTaskPriority} onValueChange={(v) => setNewTaskPriority(v as Task["priority"])}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
                className="w-40"
              />
              <Button onClick={addTask} className="gradient-tasks text-white border-0 hover:opacity-90">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(["all", "active", "completed"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
            className={cn(
              "capitalize",
              filter === f && "gradient-tasks text-white border-0"
            )}
          >
            {f}
          </Button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No tasks found</p>
              <p className="text-sm mt-1">Add a task to get started</p>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task) => (
            <Card
              key={task.id}
              className={cn(
                "group transition-all duration-200 hover:shadow-md",
                task.completed && "opacity-60"
              )}
            >
              <CardContent className="py-3 flex items-center gap-3">
                <button
                  onClick={() => toggleTask(task.id)}
                  className="shrink-0"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-tasks" />
                  ) : (
                    <Circle className="w-6 h-6 text-muted-foreground hover:text-tasks transition-colors" />
                  )}
                </button>
                
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-medium truncate",
                    task.completed && "line-through text-muted-foreground"
                  )}>
                    {task.title}
                  </p>
                  {task.dueDate && (
                    <div className="flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className={cn(
                        "text-xs",
                        isOverdue(task.dueDate) && !task.completed
                          ? "text-destructive"
                          : "text-muted-foreground"
                      )}>
                        {formatDueDate(task.dueDate)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={priorityColors[task.priority]}>
                    <Flag className={cn("w-3 h-3 mr-1", priorityIcons[task.priority])} />
                    {task.priority}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
