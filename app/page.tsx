"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import useSWR, { useSWRConfig } from "swr"
import { HelpCircle, MoreVertical, Radio, AlertTriangle, Settings } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationPanel } from "@/components/notification-panel"
import { StatCards } from "@/components/stat-cards"
import { TableToolbar } from "@/components/table-toolbar"
import { CompanyAccordion } from "@/components/company-accordion"
import { AddSubscriptionDialog } from "@/components/add-subscription-dialog"
import { ImportDialog } from "@/components/import-dialog"
import { SettingsDialog } from "@/components/settings-dialog"
import type {
  Subscription,
  DashboardMetrics,
  AlertSubscription,
  CompanyGroup,
} from "@/lib/data"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function DashboardPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [sortField, setSortField] = useState("")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [editingSub, setEditingSub] = useState<Subscription | null>(null)
  const [statsPeriod, setStatsPeriod] = useState<"all" | "month">("all")
  const { mutate: globalMutate } = useSWRConfig()

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("")
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const { data: dashboardData, isLoading } = useSWR<{
    metrics: DashboardMetrics
    alerts: {
      total: number
      critical: number
      warning: number
      subscriptions: AlertSubscription[]
    }
    groups: CompanyGroup[]
  }>(`/api/dashboard/all?period=${statsPeriod}`, fetcher, {
    keepPreviousData: true,
    revalidateOnFocus: true,
    revalidateIfStale: true
  })

  const metrics = dashboardData?.metrics
  const alertsData = dashboardData?.alerts
  const alerts: AlertSubscription[] = alertsData?.subscriptions || []
  const allGroups: CompanyGroup[] = dashboardData?.groups || []

  const filteredGroups = useMemo(() => {
    let groups = [...allGroups]

    if (statusFilter !== "All") {
      groups = groups
        .map((g) => ({
          ...g,
          stations: g.stations.filter((s) => s.status === statusFilter),
        }))
        .filter((g) => g.stations.length > 0)
    }

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase()
      groups = groups
        .map((g) => {
          const orgMatch = g.organization_name.toLowerCase().includes(q)
          if (orgMatch) return g
          const matchedStations = g.stations.filter(
            (s) =>
              s.station_nickname.toLowerCase().includes(q) ||
              s.customer_name.toLowerCase().includes(q) ||
              s.phone_number.includes(q) ||
              s.service_location.toLowerCase().includes(q)
          )
          return { ...g, stations: matchedStations }
        })
        .filter((g) => g.stations.length > 0)
    }

    return groups
  }, [allGroups, statusFilter, debouncedSearch])

  const revalidateAll = useCallback(() => {
    globalMutate(`/api/dashboard/all?period=${statsPeriod}`)
  }, [globalMutate, statsPeriod])

  const handleStatusFilter = useCallback((status: string) => {
    setStatusFilter(status)
  }, [])

  const handleSort = useCallback(
    (field: string) => {
      if (sortField === field) {
        setSortDirection((d) => (d === "asc" ? "desc" : "asc"))
      } else {
        setSortField(field)
        setSortDirection("desc")
      }
    },
    [sortField]
  )

  const handleExport = useCallback(() => {
    window.open("/api/export", "_blank")
  }, [])

  const handleAddNew = useCallback(() => {
    setEditingSub(null)
    setDialogOpen(true)
  }, [])

  const handleRenew = useCallback((sub: Subscription) => {
    setEditingSub(sub)
    setDialogOpen(true)
  }, [])

  const handleDeactivate = useCallback(
    async (sub: Subscription) => {
      const newStatus = sub.status === "Active" ? "Inactive" : "Active"
      await fetch(`/api/subscriptions/${sub.subscription_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      await revalidateAll()
    },
    [revalidateAll]
  )

  const handleDelete = useCallback(
    async (sub: Subscription) => {
      if (confirm(`Are you sure you want to delete the subscription for ${sub.station_nickname}?`)) {
        try {
          const res = await fetch(`/api/subscriptions/${sub.subscription_id}`, {
            method: "DELETE"
          })
          if (res.ok) {
            await revalidateAll()
          } else {
            alert("Failed to delete subscription.")
          }
        } catch (err) {
          console.error("Delete error:", err)
        }
      }
    },
    [revalidateAll]
  )

  const handleAddSubmit = useCallback(async (data: Partial<Subscription>) => {
    if (editingSub) {
      await fetch(`/api/subscriptions/${editingSub.subscription_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
    } else {
      await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
    }
    setDialogOpen(false)
    await revalidateAll()
  }, [editingSub, revalidateAll])

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Radio className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-card-foreground">SigLink</h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">Network Operations</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <NotificationPanel
              alerts={alerts}
              totalAlerts={alertsData?.total || 0}
              criticalCount={alertsData?.critical || 0}
              warningCount={alertsData?.warning || 0}
            />
            <ThemeToggle />
            <div className="h-8 w-px bg-border/60 mx-1 hidden sm:block" />
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="flex flex-col gap-8 lg:gap-10">
          <StatCards
            totalRevenue={metrics?.total_revenue || 0}
            activeStations={metrics?.active_stations || 0}
            pendingInstalls={metrics?.pending_installs || 0}
            urgentAlerts={metrics?.urgent_alerts || 0}
            period={statsPeriod}
            onPeriodChange={setStatsPeriod}
            isLoading={isLoading}
          />

          {alertsData && alertsData.total > 0 && (
            <div className="flex animate-fade-in items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/30 dark:bg-amber-950/20">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                  {alertsData.total} subscription
                  {alertsData.total !== 1 ? "s" : ""} expiring within 5 days
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  {alertsData.critical} critical, {alertsData.warning} warning
                  &mdash; companies with alerts are highlighted below
                </p>
              </div>
            </div>
          )}

          <TableToolbar
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={handleStatusFilter}
            onSort={handleSort}
            sortField={sortField}
            sortDirection={sortDirection}
            onAddNew={handleAddNew}
            onExport={handleExport}
            onImport={() => setImportDialogOpen(true)}
          />

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[72px] w-full animate-pulse rounded-2xl bg-muted/40" />
              ))}
            </div>
          ) : (
            <CompanyAccordion
              groups={filteredGroups}
              alerts={alerts}
              onRenew={handleRenew}
              onDeactivate={handleDeactivate}
              onDelete={handleDelete}
            />
          )}
        </div>
      </main>

      {dialogOpen && (
        <AddSubscriptionDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleAddSubmit}
          editData={editingSub}
        />
      )}

      {importDialogOpen && (
        <ImportDialog
          open={importDialogOpen}
          onOpenChange={setImportDialogOpen}
          onImported={revalidateAll}
        />
      )}

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </div>
  )
}
