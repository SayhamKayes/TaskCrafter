import { useState, useEffect, useCallback } from "react";
import { Play, Pause, RotateCcw, Timer as TimerIcon, Coffee, Focus, Settings2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type TimerMode = "stopwatch" | "countdown" | "pomodoro";
type PomodoroPhase = "work" | "break" | "longBreak";

const DEFAULT_POMODORO = {
  work: 25 * 60,
  break: 5 * 60,
  longBreak: 15 * 60,
};

export default function TimerPage() {
  const [mode, setMode] = useState<TimerMode>("pomodoro");
  const [pomodoroTimes, setPomodoroTimes] = useState({ ...DEFAULT_POMODORO });
  const [time, setTime] = useState(pomodoroTimes.work);
  const [isRunning, setIsRunning] = useState(false);
  const [pomodoroPhase, setPomodoroPhase] = useState<PomodoroPhase>("work");
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [countdownInput, setCountdownInput] = useState({ hours: 0, minutes: 25, seconds: 0 });
  const [showSettings, setShowSettings] = useState(false);
  const [editTimes, setEditTimes] = useState({
    work: DEFAULT_POMODORO.work / 60,
    break: DEFAULT_POMODORO.break / 60,
    longBreak: DEFAULT_POMODORO.longBreak / 60,
  });

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0) {
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSaveSettings = () => {
    const newTimes = {
      work: Math.max(1, editTimes.work) * 60,
      break: Math.max(1, editTimes.break) * 60,
      longBreak: Math.max(1, editTimes.longBreak) * 60,
    };
    setPomodoroTimes(newTimes);
    setTime(newTimes[pomodoroPhase]);
    setIsRunning(false);
    setShowSettings(false);
  };

  const handleReset = useCallback(() => {
    setIsRunning(false);
    if (mode === "stopwatch") {
      setTime(0);
    } else if (mode === "countdown") {
      const totalSeconds =
        countdownInput.hours * 3600 +
        countdownInput.minutes * 60 +
        countdownInput.seconds;
      setTime(totalSeconds);
    } else {
      setTime(pomodoroTimes[pomodoroPhase]);
    }
  }, [mode, pomodoroPhase, countdownInput, pomodoroTimes]);

  const handleModeChange = (newMode: TimerMode) => {
    setMode(newMode);
    setIsRunning(false);
    setShowSettings(false);
    if (newMode === "stopwatch") {
      setTime(0);
    } else if (newMode === "countdown") {
      const totalSeconds =
        countdownInput.hours * 3600 +
        countdownInput.minutes * 60 +
        countdownInput.seconds;
      setTime(totalSeconds);
    } else {
      setPomodoroPhase("work");
      setTime(pomodoroTimes.work);
    }
  };

  const handlePomodoroPhaseChange = (phase: PomodoroPhase) => {
    setPomodoroPhase(phase);
    setTime(pomodoroTimes[phase]);
    setIsRunning(false);
  };

  const playAlarm = useCallback(() => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const playBeep = (startTime: number, freq: number) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.value = freq;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
      osc.start(startTime);
      osc.stop(startTime + 0.3);
    };
    playBeep(audioCtx.currentTime, 800);
    playBeep(audioCtx.currentTime + 0.35, 800);
    playBeep(audioCtx.currentTime + 0.7, 1000);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => {
          if (mode === "stopwatch") {
            return prevTime + 1;
          } else {
            if (prevTime <= 1) {
              setIsRunning(false);
              playAlarm();
              if (mode === "pomodoro") {
                if (pomodoroPhase === "work") {
                  const newCount = pomodoroCount + 1;
                  setPomodoroCount(newCount);
                  if (newCount % 4 === 0) {
                    setPomodoroPhase("longBreak");
                    return pomodoroTimes.longBreak;
                  } else {
                    setPomodoroPhase("break");
                    return pomodoroTimes.break;
                  }
                } else {
                  setPomodoroPhase("work");
                  return pomodoroTimes.work;
                }
              }
              return 0;
            }
            return prevTime - 1;
          }
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, mode, pomodoroPhase, pomodoroCount, pomodoroTimes]);

  const progress = mode === "pomodoro" 
    ? ((pomodoroTimes[pomodoroPhase] - time) / pomodoroTimes[pomodoroPhase]) * 100
    : mode === "countdown"
    ? ((countdownInput.hours * 3600 + countdownInput.minutes * 60 + countdownInput.seconds - time) / 
       (countdownInput.hours * 3600 + countdownInput.minutes * 60 + countdownInput.seconds || 1)) * 100
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <div className="p-2 rounded-xl bg-timer-bg">
            <TimerIcon className="w-6 h-6 text-timer" />
          </div>
          Timer
        </h1>
        <p className="text-muted-foreground mt-1">Stay focused and track your time</p>
      </div>

      {/* Timer Tabs */}
      <Tabs value={mode} onValueChange={(v) => handleModeChange(v as TimerMode)}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="pomodoro">Pomodoro</TabsTrigger>
          <TabsTrigger value="stopwatch">Stopwatch</TabsTrigger>
          <TabsTrigger value="countdown">Countdown</TabsTrigger>
        </TabsList>

        <div className="mt-8 flex justify-center">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center pb-2">
              <div className="flex items-center justify-center relative">
                <CardTitle className="text-lg font-medium text-muted-foreground">
                  {mode === "pomodoro" && (
                    <span className="flex items-center justify-center gap-2">
                      {pomodoroPhase === "work" ? (
                        <><Focus className="w-5 h-5 text-timer" /> Focus Time</>
                      ) : pomodoroPhase === "break" ? (
                        <><Coffee className="w-5 h-5 text-tasks" /> Short Break</>
                      ) : (
                        <><Coffee className="w-5 h-5 text-notes" /> Long Break</>
                      )}
                    </span>
                  )}
                  {mode === "stopwatch" && "Stopwatch"}
                  {mode === "countdown" && "Countdown Timer"}
                </CardTitle>
                {mode === "pomodoro" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 h-8 w-8 text-muted-foreground"
                    onClick={() => {
                      setShowSettings(!showSettings);
                      setEditTimes({
                        work: pomodoroTimes.work / 60,
                        break: pomodoroTimes.break / 60,
                        longBreak: pomodoroTimes.longBreak / 60,
                      });
                    }}
                  >
                    <Settings2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-4 pb-8">
              {/* Settings Panel */}
              {showSettings && mode === "pomodoro" && (
                <div className="bg-muted/50 rounded-lg p-4 mb-6 space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Edit Durations (minutes)</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Focus</Label>
                      <Input
                        type="number"
                        min="1"
                        max="120"
                        value={editTimes.work}
                        onChange={(e) => setEditTimes({ ...editTimes, work: parseInt(e.target.value) || 1 })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Short Break</Label>
                      <Input
                        type="number"
                        min="1"
                        max="60"
                        value={editTimes.break}
                        onChange={(e) => setEditTimes({ ...editTimes, break: parseInt(e.target.value) || 1 })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Long Break</Label>
                      <Input
                        type="number"
                        min="1"
                        max="60"
                        value={editTimes.longBreak}
                        onChange={(e) => setEditTimes({ ...editTimes, longBreak: parseInt(e.target.value) || 1 })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <Button size="sm" onClick={handleSaveSettings} className="w-full">
                    <Check className="w-4 h-4 mr-1" /> Apply
                  </Button>
                </div>
              )}

              {/* Circular Progress */}
              <div className="relative w-64 h-64 mx-auto mb-8">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    className="text-muted stroke-current"
                    strokeWidth="4"
                    fill="none"
                    r="45"
                    cx="50"
                    cy="50"
                  />
                  <circle
                    className={cn(
                      "stroke-current transition-all duration-300",
                      pomodoroPhase === "work" ? "text-timer" : "text-tasks"
                    )}
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="none"
                    r="45"
                    cx="50"
                    cy="50"
                    style={{
                      strokeDasharray: `${2 * Math.PI * 45}`,
                      strokeDashoffset: `${2 * Math.PI * 45 * (1 - progress / 100)}`,
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl font-mono-display font-bold tracking-tight">
                    {formatTime(time)}
                  </span>
                </div>
              </div>

              {/* Pomodoro Phase Buttons */}
              {mode === "pomodoro" && (
                <div className="flex justify-center gap-2 mb-6">
                  <Button
                    variant={pomodoroPhase === "work" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePomodoroPhaseChange("work")}
                    className={pomodoroPhase === "work" ? "gradient-timer text-white border-0" : ""}
                  >
                    Focus
                  </Button>
                  <Button
                    variant={pomodoroPhase === "break" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePomodoroPhaseChange("break")}
                    className={pomodoroPhase === "break" ? "gradient-tasks text-white border-0" : ""}
                  >
                    Short Break
                  </Button>
                  <Button
                    variant={pomodoroPhase === "longBreak" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePomodoroPhaseChange("longBreak")}
                    className={pomodoroPhase === "longBreak" ? "gradient-notes text-white border-0" : ""}
                  >
                    Long Break
                  </Button>
                </div>
              )}

              {/* Countdown Input */}
              {mode === "countdown" && !isRunning && (
                <div className="flex justify-center gap-2 mb-6">
                  <div className="flex flex-col items-center">
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={countdownInput.hours}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setCountdownInput({ ...countdownInput, hours: val });
                        setTime(val * 3600 + countdownInput.minutes * 60 + countdownInput.seconds);
                      }}
                      className="w-16 text-center text-2xl font-mono-display bg-muted rounded-lg p-2"
                    />
                    <span className="text-xs text-muted-foreground mt-1">Hours</span>
                  </div>
                  <span className="text-2xl font-bold self-start pt-2">:</span>
                  <div className="flex flex-col items-center">
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={countdownInput.minutes}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setCountdownInput({ ...countdownInput, minutes: val });
                        setTime(countdownInput.hours * 3600 + val * 60 + countdownInput.seconds);
                      }}
                      className="w-16 text-center text-2xl font-mono-display bg-muted rounded-lg p-2"
                    />
                    <span className="text-xs text-muted-foreground mt-1">Minutes</span>
                  </div>
                  <span className="text-2xl font-bold self-start pt-2">:</span>
                  <div className="flex flex-col items-center">
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={countdownInput.seconds}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setCountdownInput({ ...countdownInput, seconds: val });
                        setTime(countdownInput.hours * 3600 + countdownInput.minutes * 60 + val);
                      }}
                      className="w-16 text-center text-2xl font-mono-display bg-muted rounded-lg p-2"
                    />
                    <span className="text-xs text-muted-foreground mt-1">Seconds</span>
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="flex justify-center gap-4">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleReset}
                  className="w-14 h-14 rounded-full p-0"
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  onClick={() => {
                    if (mode === "countdown" && time === 0) {
                      const totalSeconds =
                        countdownInput.hours * 3600 +
                        countdownInput.minutes * 60 +
                        countdownInput.seconds;
                      setTime(totalSeconds);
                    }
                    setIsRunning(!isRunning);
                  }}
                  className={cn(
                    "w-20 h-20 rounded-full p-0",
                    isRunning 
                      ? "bg-destructive hover:bg-destructive/90" 
                      : "gradient-timer hover:opacity-90"
                  )}
                >
                  {isRunning ? (
                    <Pause className="w-8 h-8 text-white" />
                  ) : (
                    <Play className="w-8 h-8 ml-1 text-white" />
                  )}
                </Button>
                <div className="w-14" />
              </div>

              {/* Pomodoro Count */}
              {mode === "pomodoro" && (
                <div className="text-center mt-6 text-sm text-muted-foreground">
                  Completed sessions: <span className="font-semibold text-foreground">{pomodoroCount}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Tabs>
    </div>
  );
}
