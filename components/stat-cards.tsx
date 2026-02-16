"use client"

import { DollarSign, Radio, Clock, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardsProps {
  totalRevenue: number
  activeStations: number
  pendingInstalls: number
  urgentAlerts: number
  isLoading?: boolean
  period?: "all" | "month"
  onPeriodChange?: (period: "all" | "month") => void
}

const cards = [
  {
    key: "revenue" as const,
    label: "Total Revenue",
    icon: DollarSign,
    format: (v: number) => `NLe ${v.toLocaleString()}`,
    color: "from-blue-100 to-blue-200/40 dark:from-blue-900/40 dark:to-blue-800/20",
    accent: "text-blue-700 dark:text-blue-400",
    iconColor: "bg-blue-600/20 text-blue-700 dark:text-blue-400",
    trend: "+2.5% vs last week",
    trendUp: true,
    borderColor: "border-blue-200 dark:border-blue-800/50"
  },
  {
    key: "active" as const,
    label: "Active Stations",
    icon: Radio,
    format: (v: number) => String(v),
    color: "from-indigo-100 to-indigo-200/40 dark:from-indigo-900/40 dark:to-indigo-800/20",
    accent: "text-indigo-700 dark:text-indigo-400",
    iconColor: "bg-indigo-600/20 text-indigo-700 dark:text-indigo-400",
    trend: "+25% total growth",
    trendUp: true,
    borderColor: "border-indigo-200 dark:border-indigo-800/50"
  },
  {
    key: "pending" as const,
    label: "Pending Installs",
    icon: Clock,
    format: (v: number) => (v).toLocaleString(),
    color: "from-amber-100 to-amber-200/40 dark:from-amber-900/40 dark:to-amber-800/20",
    accent: "text-amber-700 dark:text-amber-400",
    iconColor: "bg-amber-600/20 text-amber-700 dark:text-amber-400",
    trend: "-0.5% vs yesterday",
    trendUp: false,
    borderColor: "border-amber-200 dark:border-amber-800/50"
  },
  {
    key: "alerts" as const,
    label: "Urgent Alerts",
    icon: AlertTriangle,
    format: (v: number) => (v).toLocaleString(),
    color: "from-rose-100 to-rose-200/40 dark:from-rose-900/40 dark:to-rose-800/20",
    accent: "text-rose-700 dark:text-rose-400",
    iconColor: "bg-rose-600/20 text-rose-700 dark:text-rose-400",
    trend: "+12% conversions",
    trendUp: true,
    borderColor: "border-rose-200 dark:border-rose-800/50"
  },
]

export function StatCards({
  totalRevenue,
  activeStations,
  pendingInstalls,
  urgentAlerts,
  isLoading,
  period = "all",
  onPeriodChange,
}: StatCardsProps) {
  const values = {
    revenue: totalRevenue,
    active: activeStations,
    pending: pendingInstalls,
    alerts: urgentAlerts,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-card-foreground">Operational Insights</h2>
          <p className="text-xs font-medium text-muted-foreground">Real-time performance metrics</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-2xl bg-muted/30 p-1.5 border border-border/50">
          <button
            onClick={() => onPeriodChange?.("all")}
            className={cn(
              "rounded-xl px-4 py-1.5 text-[11px] font-bold transition-all duration-300",
              period === "all"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            All time
          </button>
          <button
            onClick={() => onPeriodChange?.("month")}
            className={cn(
              "rounded-xl px-4 py-1.5 text-[11px] font-bold transition-all duration-300",
              period === "month"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            Last Month
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {cards.map((card, i) => {
          const Icon = card.icon
          return (
            <div
              key={card.key}
              className={cn(
                "group relative flex flex-col justify-between overflow-hidden rounded-[32px] border bg-gradient-to-br p-7",
                "transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/5",
                card.color,
                card.borderColor,
                "animate-fade-in-up"
              )}
              style={{ animationDelay: `${i * 100}ms`, animationFillMode: "backwards" }}
            >
              <div className="mb-6 flex items-center justify-between">
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm", card.iconColor)}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-1 rounded-full bg-background/50 px-2 py-1 text-[10px] font-bold text-muted-foreground backdrop-blur-md border border-border/50">
                  {card.trendUp ? (
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={card.trendUp ? "text-emerald-500" : "text-red-500"}>
                    {card.trend.split(' ')[0]}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground/70">
                  {card.label}
                </p>
                {isLoading ? (
                  <div className="mt-2 h-10 w-32 animate-pulse rounded-xl bg-muted/40" />
                ) : (
                  <p className={cn("text-4xl font-black tracking-tight", card.accent)}>
                    {card.format(values[card.key])}
                  </p>
                )}
              </div>

              {/* Decorative circle */}
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-2xl transition-all group-hover:bg-white/20" />
            </div>
          )
        })}
      </div>
    </div>
  )
}
