"use client"

import { useState, useRef, useEffect } from "react"
import { Bell, AlertTriangle, Clock, X, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { AlertSubscription } from "@/lib/data"

interface NotificationPanelProps {
  alerts: AlertSubscription[]
  totalAlerts: number
  criticalCount: number
  warningCount: number
}

export function NotificationPanel({
  alerts,
  totalAlerts,
  criticalCount,
  warningCount,
}: NotificationPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [isOpen])

  const activeAlerts = alerts.filter((a) => !dismissed.has(a.subscription_id))
  const activeCount = activeAlerts.length

  return (
    <div className="relative" ref={panelRef}>
      <Button
        variant="ghost"
        size="icon"
        className="relative h-8 w-8 text-muted-foreground hover:text-foreground md:h-9 md:w-9"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4 md:h-5 md:w-5" />
        {activeCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
            {activeCount > 9 ? "9+" : activeCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div
          className={cn(
            "absolute right-0 top-full z-50 mt-2 w-[85vw] max-w-[340px] animate-scale-in overflow-hidden rounded-2xl border border-border bg-card shadow-2xl",
            "sm:w-[380px] sm:max-w-none origin-top-right"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-card-foreground">
                Notifications
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {dismissed.size > 0 && (
                <button
                  onClick={() => setDismissed(new Set())}
                  className="text-[10px] font-medium text-primary hover:underline"
                >
                  Restore all
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Summary badges */}
          <div className="flex gap-2 border-b border-border px-4 py-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">
              <AlertTriangle className="h-3 w-3" />
              {criticalCount} critical
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
              <Clock className="h-3 w-3" />
              {warningCount} warning
            </span>
            <span className="ml-auto text-[10px] text-muted-foreground">
              {totalAlerts} total
            </span>
          </div>

          {/* Alert list */}
          <div className="max-h-[320px] overflow-y-auto">
            {activeAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10">
                <Check className="h-8 w-8 text-emerald-500" />
                <p className="text-sm font-medium text-muted-foreground">
                  All caught up
                </p>
              </div>
            ) : (
              activeAlerts.map((alert) => (
                <div
                  key={alert.subscription_id}
                  className={cn(
                    "flex items-start gap-3 border-b border-border/50 px-4 py-3 last:border-0",
                    "hover:bg-muted/50",
                    alert.severity === "critical" &&
                    "bg-destructive/5 dark:bg-destructive/10"
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                      alert.severity === "critical"
                        ? "bg-destructive/15 text-destructive dark:bg-destructive/25"
                        : "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400"
                    )}
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-card-foreground">
                      {alert.station_nickname}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {alert.organization_name} &middot;{" "}
                      {alert.customer_name}
                    </p>
                    <p
                      className={cn(
                        "mt-0.5 text-[10px] font-semibold",
                        alert.severity === "critical"
                          ? "text-destructive"
                          : "text-amber-600 dark:text-amber-400"
                      )}
                    >
                      {alert.days_remaining === 0
                        ? "Expires today!"
                        : `Expires in ${alert.days_remaining} day${alert.days_remaining !== 1 ? "s" : ""}`}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setDismissed((prev) => {
                        const next = new Set(prev)
                        next.add(alert.subscription_id)
                        return next
                      })
                    }
                    className="mt-0.5 shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Dismiss notification"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
