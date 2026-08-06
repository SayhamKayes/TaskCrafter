import { useState, useEffect } from "react";
import { Moon, Sun, Sunrise, Sunset, Clock, MapPin, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PrayerTimes {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

const prayerInfo = [
  { name: "Fajr", key: "Fajr", icon: Sunrise, gradient: "from-indigo-500 to-blue-600" },
  { name: "Dhuhr", key: "Dhuhr", icon: Sun, gradient: "from-amber-400 to-orange-500" },
  { name: "Asr", key: "Asr", icon: Sunset, gradient: "from-orange-400 to-red-500" },
  { name: "Maghrib", key: "Maghrib", icon: Sunset, gradient: "from-rose-500 to-purple-600" },
  { name: "Isha", key: "Isha", icon: Moon, gradient: "from-purple-600 to-indigo-800" },
];

function parseTime(timeStr: string): Date {
  const [time] = timeStr.split(" ");
  const [h, m] = time.split(":").map(Number);
  const now = new Date();
  now.setHours(h, m, 0, 0);
  return now;
}

export default function SalahPage() {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState("Detecting location...");
  const [nextPrayer, setNextPrayer] = useState<string | null>(null);
  const [countdown, setCountdown] = useState("");

  // Update clock every second
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationName(`${pos.coords.latitude.toFixed(2)}°, ${pos.coords.longitude.toFixed(2)}°`);
        },
        () => {
          // Default to Dhaka if geolocation fails
          setLocation({ lat: 23.8103, lng: 90.4125 });
          setLocationName("Dhaka (default)");
        }
      );
    } else {
      setLocation({ lat: 23.8103, lng: 90.4125 });
      setLocationName("Dhaka (default)");
    }
  }, []);

  // Fetch prayer times
  useEffect(() => {
    if (!location) return;

    const fetchPrayerTimes = async () => {
      setLoading(true);
      try {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, "0");
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const yyyy = today.getFullYear();
        const res = await fetch(
          `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${location.lat}&longitude=${location.lng}&method=2`
        );
        const data = await res.json();
        const t = data.data.timings;
        setPrayerTimes({
          Fajr: t.Fajr,
          Dhuhr: t.Dhuhr,
          Asr: t.Asr,
          Maghrib: t.Maghrib,
          Isha: t.Isha,
        });
      } catch {
        // Fallback times
        setPrayerTimes({
          Fajr: "05:15",
          Dhuhr: "12:30",
          Asr: "15:45",
          Maghrib: "18:10",
          Isha: "19:30",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPrayerTimes();
  }, [location]);

  // Calculate next prayer & countdown
  useEffect(() => {
    if (!prayerTimes) return;

    const now = currentTime;
    let found = false;

    for (const p of prayerInfo) {
      const pTime = parseTime(prayerTimes[p.key as keyof PrayerTimes]);
      if (pTime > now) {
        setNextPrayer(p.key);
        const diff = pTime.getTime() - now.getTime();
        const hrs = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setCountdown(
          `${hrs > 0 ? hrs + "h " : ""}${mins}m ${secs}s`
        );
        found = true;
        break;
      }
    }

    if (!found) {
      setNextPrayer("Fajr");
      setCountdown("Tomorrow");
    }
  }, [currentTime, prayerTimes]);

  const formatCurrentTime = () => {
    return currentTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isPassed = (timeStr: string) => {
    return parseTime(timeStr) < currentTime;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
            <Moon className="w-6 h-6 text-emerald-500" />
          </div>
          Salah Times
        </h1>
        <p className="text-muted-foreground mt-1">Never miss your prayers — auto-updated daily</p>
      </div>

      {/* Current Time & Next Prayer */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-emerald-500/20">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">{formatDate()}</p>
            <p className="text-4xl font-mono font-bold tracking-tight">{formatCurrentTime()}</p>
            <div className="flex items-center justify-center gap-1.5 mt-3 text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              {locationName}
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-teal-500/5">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">Next Prayer</p>
            <p className="text-3xl font-bold text-emerald-500">{nextPrayer || "—"}</p>
            <p className="text-lg font-mono text-muted-foreground mt-1">
              {countdown ? `in ${countdown}` : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Prayer Times List */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Today's Prayer Times</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation((l) => l ? { ...l } : l)}
            className="text-muted-foreground"
          >
            <RefreshCw className={cn("w-4 h-4 mr-1", loading && "animate-spin")} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading prayer times...</div>
          ) : (
            prayerInfo.map((prayer) => {
              const time = prayerTimes?.[prayer.key as keyof PrayerTimes] || "--:--";
              const isNext = nextPrayer === prayer.key;
              const passed = prayerTimes ? isPassed(time) : false;

              return (
                <div
                  key={prayer.key}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl transition-all",
                    isNext
                      ? "bg-emerald-500/10 border border-emerald-500/30 shadow-sm"
                      : "bg-muted/30 hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2.5 rounded-xl bg-gradient-to-br text-white",
                      prayer.gradient,
                      passed && !isNext && "opacity-40"
                    )}>
                      <prayer.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={cn(
                        "font-semibold",
                        passed && !isNext && "text-muted-foreground"
                      )}>
                        {prayer.name}
                      </p>
                      {isNext && (
                        <p className="text-xs text-emerald-500 font-medium">Up next</p>
                      )}
                      {passed && !isNext && (
                        <p className="text-xs text-muted-foreground">Passed</p>
                      )}
                    </div>
                  </div>
                  <span className={cn(
                    "text-xl font-mono font-semibold",
                    isNext ? "text-emerald-500" : passed ? "text-muted-foreground" : ""
                  )}>
                    {time}
                  </span>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
