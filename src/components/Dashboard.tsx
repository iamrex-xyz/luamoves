import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { MovingInfo } from "@/pages/Index";
import { useTasks } from "@/hooks/useTasks";
import { Task } from "@/lib/taskGenerator";
import {
  Home,
  Clock,
  ListChecks,
  LogOut,
  AlertCircle,
  User,
  Users,
  CheckCircle2,
  Circle,
  Settings,
} from "lucide-react";
import { useMemo } from "react";

type DashboardProps = {
  movingInfo: MovingInfo;
  onNavigate: (view: "dashboard" | "tasks" | "timeline" | "settings") => void;
  onLogout: () => void;
};

export const Dashboard = ({ movingInfo, onNavigate, onLogout }: DashboardProps) => {
  const { tasks, isLoading, toggleTaskStatus } = useTasks(movingInfo);

  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "done").length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const daysUntilMove = Math.ceil(
    (new Date(movingInfo.movingDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  // Get priority tasks (upcoming deadlines, not completed)
  const priorityTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return tasks
      .filter(task => {
        if (task.status === "done") return false;
        const deadline = new Date(task.deadline);
        deadline.setHours(0, 0, 0, 0);
        const daysUntil = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntil <= 14; // Next 2 weeks
      })
      .sort((a, b) => a.deadline.getTime() - b.deadline.getTime())
      .slice(0, 10);
  }, [tasks]);

  // Split tasks by assignment
  const myTasks = useMemo(() => 
    priorityTasks.filter(task => !task.assignedTo && !task.assignedToEmail),
    [priorityTasks]
  );

  const assignedTasks = useMemo(() => 
    priorityTasks.filter(task => task.assignedTo || task.assignedToEmail),
    [priorityTasks]
  );

  const getStatusBadge = (task: Task) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(task.deadline);
    deadline.setHours(0, 0, 0, 0);
    const isOverdue = deadline < today;

    if (task.status === "done") {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Voltooid</Badge>;
    }
    if (task.status === "in_progress") {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Bezig</Badge>;
    }
    if (isOverdue) {
      return <Badge variant="destructive">Verlopen</Badge>;
    }
    return <Badge variant="outline">Te doen</Badge>;
  };

  const TaskItem = ({ task }: { task: Task }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(task.deadline);
    deadline.setHours(0, 0, 0, 0);
    const daysUntil = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const isOverdue = deadline < today && task.status !== "done";

    return (
      <div className={`flex items-start gap-3 p-3 rounded-lg border ${
        isOverdue ? "border-destructive/30 bg-destructive/5" : "border-border bg-card"
      }`}>
        <Checkbox
          checked={task.status === "done"}
          onCheckedChange={() => toggleTaskStatus(task.id)}
          className="mt-1"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className={`font-medium text-sm ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
              {task.title}
            </h4>
            {getStatusBadge(task)}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {task.deadlineLabel}
              {daysUntil === 0 && " (vandaag)"}
              {daysUntil === 1 && " (morgen)"}
              {daysUntil > 1 && ` (${daysUntil} dagen)`}
              {isOverdue && " (verlopen)"}
            </span>
            {task.assignedToEmail && (
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {task.assignedToEmail}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-white p-5 md:p-6 pb-8 md:pb-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
            <div className="p-2.5 md:p-2 bg-white/10 rounded-lg backdrop-blur">
              <Home className="w-7 h-7 md:w-6 md:h-6" />
            </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Jouw verhuizing</h1>
                <p className="text-white/80 text-sm md:text-base mt-1">
                  {movingInfo.oldAddress} → {movingInfo.newAddress}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              className="text-white hover:bg-white/10 h-12 w-12 md:h-10 md:w-10"
              title="Uitloggen"
            >
              <LogOut className="w-6 h-6 md:w-5 md:h-5" />
            </Button>
          </div>

          <Card className="p-6 md:p-5 bg-white/10 backdrop-blur border-white/20">
            <div className="flex items-center gap-6">
              {/* Circular Progress */}
              <div className="relative flex-shrink-0">
                <svg className="w-28 h-28 md:w-24 md:h-24 transform -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="50"
                    className="md:cx-48 md:cy-48 md:r-42"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="50"
                    className="md:cx-48 md:cy-48 md:r-42"
                    stroke="white"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - progressPercentage / 100)}`}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 1s ease-out" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl md:text-2xl font-bold text-white">
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex-1 space-y-3 text-white">
                <div>
                  <h3 className="text-lg md:text-base font-semibold mb-1">Jouw voortgang</h3>
                  <p className="text-white/80 text-sm">
                    {completedTasks} van {totalTasks} taken voltooid
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <div className="text-2xl md:text-xl font-bold">{totalTasks - completedTasks}</div>
                    <div className="text-xs text-white/80">Te doen</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <div className="text-2xl md:text-xl font-bold">{daysUntilMove}</div>
                    <div className="text-xs text-white/80">Dagen resterend</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-4xl mx-auto px-4 -mt-6 mb-6">
        <div className="grid grid-cols-3 gap-3">
          <Button
            variant="secondary"
            className="h-auto py-5 md:py-4 flex flex-col gap-2 shadow-md min-h-[100px]"
            onClick={() => onNavigate("tasks")}
          >
            <ListChecks className="w-7 h-7 md:w-6 md:h-6" />
            <span className="text-base md:text-sm font-semibold">Alle taken</span>
          </Button>
          <Button
            variant="secondary"
            className="h-auto py-5 md:py-4 flex flex-col gap-2 shadow-md min-h-[100px]"
            onClick={() => onNavigate("timeline")}
          >
            <Clock className="w-7 h-7 md:w-6 md:h-6" />
            <span className="text-base md:text-sm font-semibold">Tijdlijn</span>
          </Button>
          <Button
            variant="secondary"
            className="h-auto py-5 md:py-4 flex flex-col gap-2 shadow-md min-h-[100px]"
            onClick={() => onNavigate("settings")}
          >
            <Settings className="w-7 h-7 md:w-6 md:h-6" />
            <span className="text-base md:text-sm font-semibold">Instellingen</span>
          </Button>
        </div>
      </div>

      {/* Priority Tasks */}
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {isLoading ? (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">Taken laden...</p>
          </Card>
        ) : (
          <>
            {/* My Priority Tasks */}
            {myTasks.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold">Mijn prioriteiten</h2>
                  <Badge variant="secondary">{myTasks.length}</Badge>
                </div>
                <Card className="p-4">
                  <div className="space-y-3">
                    {myTasks.map((task) => (
                      <TaskItem key={task.id} task={task} />
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Assigned Tasks */}
            {assignedTasks.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold">Toegewezen aan anderen</h2>
                  <Badge variant="secondary">{assignedTasks.length}</Badge>
                </div>
                <Card className="p-4">
                  <div className="space-y-3">
                    {assignedTasks.map((task) => (
                      <TaskItem key={task.id} task={task} />
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {priorityTasks.length === 0 && (
              <Card className="p-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-2">Geen dringende taken!</h3>
                <p className="text-muted-foreground mb-4">
                  Alle taken voor de komende 2 weken zijn voltooid of je hebt nog geen taken.
                </p>
                <Button onClick={() => onNavigate("tasks")}>
                  Bekijk alle taken
                </Button>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};
