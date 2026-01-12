import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { Download, TrendingUp, TrendingDown, Calendar, BarChart3, PieChartIcon, LineChartIcon } from "lucide-react";
import { format, subDays, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, isSameDay, isSameWeek, isSameMonth } from "date-fns";

interface Application {
  id: string;
  status: string;
  submitted_at: string | null;
  created_at?: string;
  program_id: string;
}

interface Program {
  id: string;
  title: string;
  category: string;
  is_active: boolean;
}

interface AdvancedAnalyticsProps {
  applications: Application[];
  programs: Program[];
  profiles: { id: string }[];
  stories: { id: string; is_approved: boolean }[];
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
  "hsl(142, 76%, 36%)",
  "hsl(38, 92%, 50%)",
  "hsl(280, 87%, 65%)",
];

const AdvancedAnalytics = ({ applications, programs, profiles, stories }: AdvancedAnalyticsProps) => {
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "12m">("30d");
  const [chartType, setChartType] = useState<"bar" | "line" | "area">("bar");

  // Calculate date range
  const dateRangeConfig = useMemo(() => {
    const now = new Date();
    switch (dateRange) {
      case "7d":
        return { start: subDays(now, 7), end: now, interval: "day" as const };
      case "30d":
        return { start: subDays(now, 30), end: now, interval: "day" as const };
      case "90d":
        return { start: subDays(now, 90), end: now, interval: "week" as const };
      case "12m":
        return { start: subMonths(now, 12), end: now, interval: "month" as const };
      default:
        return { start: subDays(now, 30), end: now, interval: "day" as const };
    }
  }, [dateRange]);

  // Generate trend data
  const trendData = useMemo(() => {
    const { start, end, interval } = dateRangeConfig;
    
    let intervals: Date[];
    if (interval === "day") {
      intervals = eachDayOfInterval({ start, end });
    } else if (interval === "week") {
      intervals = eachWeekOfInterval({ start, end });
    } else {
      intervals = eachMonthOfInterval({ start, end });
    }

    return intervals.map((date) => {
      const appsInPeriod = applications.filter((app) => {
        const appDate = app.submitted_at ? new Date(app.submitted_at) : null;
        if (!appDate) return false;
        
        if (interval === "day") return isSameDay(appDate, date);
        if (interval === "week") return isSameWeek(appDate, date);
        return isSameMonth(appDate, date);
      });

      return {
        date: format(date, interval === "month" ? "MMM yyyy" : interval === "week" ? "MMM d" : "MMM d"),
        applications: appsInPeriod.length,
        approved: appsInPeriod.filter((a) => a.status === "approved").length,
        denied: appsInPeriod.filter((a) => a.status === "denied").length,
      };
    });
  }, [applications, dateRangeConfig]);

  // Status distribution for pie chart
  const statusDistribution = useMemo(() => {
    const statusCounts = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1).replace("_", " "),
      value: count,
    }));
  }, [applications]);

  // Program popularity
  const programPopularity = useMemo(() => {
    const appsByProgram = applications.reduce((acc, app) => {
      acc[app.program_id] = (acc[app.program_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return programs
      .map((program) => ({
        name: program.title.length > 20 ? program.title.slice(0, 20) + "..." : program.title,
        applications: appsByProgram[program.id] || 0,
      }))
      .sort((a, b) => b.applications - a.applications)
      .slice(0, 10);
  }, [applications, programs]);

  // Calculate trends
  const currentPeriodApps = useMemo(() => {
    const { start } = dateRangeConfig;
    return applications.filter((app) => {
      const appDate = app.submitted_at ? new Date(app.submitted_at) : null;
      return appDate && appDate >= start;
    }).length;
  }, [applications, dateRangeConfig]);

  const previousPeriodApps = useMemo(() => {
    const { start, end } = dateRangeConfig;
    const periodLength = end.getTime() - start.getTime();
    const prevStart = new Date(start.getTime() - periodLength);
    const prevEnd = start;

    return applications.filter((app) => {
      const appDate = app.submitted_at ? new Date(app.submitted_at) : null;
      return appDate && appDate >= prevStart && appDate < prevEnd;
    }).length;
  }, [applications, dateRangeConfig]);

  const trendPercentage = previousPeriodApps > 0
    ? Math.round(((currentPeriodApps - previousPeriodApps) / previousPeriodApps) * 100)
    : currentPeriodApps > 0 ? 100 : 0;

  // Approval rate
  const approvalRate = useMemo(() => {
    const reviewed = applications.filter((a) => a.status === "approved" || a.status === "denied");
    if (reviewed.length === 0) return 0;
    return Math.round((reviewed.filter((a) => a.status === "approved").length / reviewed.length) * 100);
  }, [applications]);

  // Export to CSV
  const exportToCSV = () => {
    const headers = ["Date", "Total Applications", "Approved", "Denied"];
    const rows = trendData.map((d) => [d.date, d.applications, d.approved, d.denied]);
    
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${dateRange}-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  const renderTrendChart = () => {
    const ChartComponent = chartType === "line" ? LineChart : chartType === "area" ? AreaChart : BarChart;
    
    return (
      <ChartContainer
        config={{
          applications: { label: "Applications", color: "hsl(var(--primary))" },
          approved: { label: "Approved", color: "hsl(142, 76%, 36%)" },
          denied: { label: "Denied", color: "hsl(var(--destructive))" },
        }}
        className="h-[350px]"
      >
        <ResponsiveContainer width="100%" height="100%">
          <ChartComponent data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            {chartType === "bar" ? (
              <>
                <Bar dataKey="applications" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="approved" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="denied" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              </>
            ) : chartType === "area" ? (
              <>
                <Area type="monotone" dataKey="applications" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.3)" />
                <Area type="monotone" dataKey="approved" stroke="hsl(142, 76%, 36%)" fill="hsl(142, 76%, 36% / 0.3)" />
              </>
            ) : (
              <>
                <Line type="monotone" dataKey="applications" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="approved" stroke="hsl(142, 76%, 36%)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="denied" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} />
              </>
            )}
          </ChartComponent>
        </ResponsiveContainer>
      </ChartContainer>
    );
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2 items-center">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={dateRange} onValueChange={(v: any) => setDateRange(v)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="12m">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <div className="flex border rounded-md">
            <Button
              variant={chartType === "bar" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setChartType("bar")}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button
              variant={chartType === "line" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setChartType("line")}
            >
              <LineChartIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={chartType === "area" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setChartType("area")}
            >
              <PieChartIcon className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Applications</p>
                <p className="text-2xl font-bold">{currentPeriodApps}</p>
              </div>
              <div className={`flex items-center gap-1 text-sm ${trendPercentage >= 0 ? "text-green-600" : "text-red-600"}`}>
                {trendPercentage >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {Math.abs(trendPercentage)}%
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Approval Rate</p>
            <p className="text-2xl font-bold">{approvalRate}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Active Programs</p>
            <p className="text-2xl font-bold">{programs.filter((p) => p.is_active).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Users</p>
            <p className="text-2xl font-bold">{profiles.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Application Trends</CardTitle>
          <CardDescription>
            Applications submitted over time with status breakdown
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderTrendChart()}
        </CardContent>
      </Card>

      {/* Secondary Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>Current application status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Programs</CardTitle>
            <CardDescription>Most applied-to programs</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ applications: { label: "Applications", color: "hsl(var(--primary))" } }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={programPopularity} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="applications" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
