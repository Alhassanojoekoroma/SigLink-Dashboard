"use client"

import { useState } from "react"
import {
  ChevronDown,
  Building2,
  User,
  MapPin,
  Phone,
  Check,
  X,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import type { CompanyGroup, Subscription, AlertSubscription } from "@/lib/data"

interface CompanyAccordionProps {
  groups: CompanyGroup[]
  alerts: AlertSubscription[]
  onRenew: (sub: Subscription) => void
  onDeactivate: (sub: Subscription) => void
  onDelete: (sub: Subscription) => void
}

function StationDetailDialog({
  station,
  isOpen,
  onOpenChange,
  alert,
}: {
  station: Subscription | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  alert?: AlertSubscription
}) {
  if (!station) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-black">{station.station_nickname}</DialogTitle>
          <DialogDescription>Customer Subscription Details</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Location</span>
            <div className="flex items-center gap-2 font-bold text-sm">
              <MapPin className="h-4 w-4 text-primary" />
              {station.service_location}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</span>
              <StatusBadge status={station.status} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Admin Email</span>
              <span className="text-sm font-bold">{station.admin_email || "N/A"}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Package</span>
              <span className="text-sm font-bold">{station.package_name}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Amount</span>
              <span className="text-sm font-bold">NLe {station.amount_paid.toLocaleString()}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Start Date</span>
              <span className="text-sm font-bold">{formatDate(station.start_date)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">End Date</span>
              <span className={cn(
                "text-sm font-bold",
                alert?.severity === "critical" && "text-red-600",
                alert?.severity === "warning" && "text-amber-600"
              )}>
                {formatDate(station.end_date)}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Contact Info</span>
            <div className="space-y-1">
              <p className="text-sm font-bold">{station.customer_name}</p>
              <p className="text-xs text-muted-foreground">{station.email}</p>
              <p className="text-xs text-muted-foreground">{station.phone_number}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        status === "Active" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
        status === "Pending" && "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
        status === "Inactive" && "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
      )}
    >
      {status === "Active" && <Check className="h-3 w-3" />}
      {status === "Pending" && <Sparkles className="h-3 w-3" />}
      {status === "Inactive" && <X className="h-3 w-3" />}
      {status}
    </span>
  )
}

const groupColorStyles = {
  business: {
    header: "bg-indigo-600 dark:bg-indigo-500",
    text: "text-indigo-600 dark:text-indigo-400",
    hover: "hover:bg-indigo-50 dark:hover:bg-indigo-950/20",
    accent: "bg-indigo-50 dark:bg-indigo-900/40"
  },
  individual: {
    header: "bg-amber-500 dark:bg-amber-400",
    text: "text-amber-600 dark:text-amber-300",
    hover: "hover:bg-amber-50 dark:hover:bg-amber-950/20",
    accent: "bg-amber-50 dark:bg-amber-900/40"
  }
}

function StationList({
  stations,
  alertMap,
  onRenew,
  onDelete,
  customerType = "business",
}: {
  stations: Subscription[]
  alertMap: Map<string, AlertSubscription>
  onRenew: (sub: Subscription) => void
  onDelete: (sub: Subscription) => void
  customerType?: "business" | "individual"
}) {
  const [selectedStation, setSelectedStation] = useState<Subscription | null>(null)
  const styles = groupColorStyles[customerType]

  return (
    <div className="w-full">
      {/* Mobile/Tablet Card Layout */}
      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:hidden">
        {stations.map((station) => {
          const alert = alertMap.get(station.subscription_id)
          return (
            <div
              key={station.subscription_id}
              onClick={() => setSelectedStation(station)}
              className={cn(
                "group relative cursor-pointer overflow-hidden rounded-2xl border bg-card transition-all hover:-translate-y-1 hover:shadow-lg",
                alert?.severity === "critical" ? "border-red-500/50" : "border-border/60",
                styles.hover
              )}
            >
              {/* Colored Header Area from User Image */}
              <div className={cn("flex h-12 items-center justify-between px-4 text-white", styles.header)}>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-90">
                  {station.subscription_id.slice(0, 8).toUpperCase()}
                </span>
                <span className="text-[10px] font-bold">
                  {formatDate(station.end_date)}
                </span>
              </div>

              <div className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {station.customer_name}
                    </p>
                    <h4 className="mt-1 truncate text-base font-black text-card-foreground">
                      {station.station_nickname}
                    </h4>
                  </div>
                  <Badge className={cn("rounded-lg px-2 py-0.5 text-[10px] font-black uppercase", styles.accent, styles.text)}>
                    {station.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between border-t border-border/40 pt-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Monthly Fee</p>
                    <p className="text-lg font-black text-card-foreground">NLe {station.amount_paid.toLocaleString()}</p>
                  </div>
                  <Button
                    size="sm"
                    className="rounded-xl h-8 px-4 text-[10px] font-bold shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onRenew(station)
                    }}
                  >
                    Renew
                  </Button>
                </div>
              </div>

              {alert && (
                <div className={cn(
                  "absolute bottom-0 left-0 right-0 h-1",
                  alert.severity === "critical" ? "bg-red-500" : "bg-amber-500"
                )} />
              )}
            </div>
          )
        })}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden lg:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-semibold uppercase tracking-wider">
                Station
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">
                Status
              </TableHead>
              <TableHead className="hidden text-xs font-semibold uppercase tracking-wider md:table-cell">
                GPS
              </TableHead>
              <TableHead className="hidden text-xs font-semibold uppercase tracking-wider sm:table-cell">
                Contact
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">
                Package
              </TableHead>
              <TableHead className="hidden text-xs font-semibold uppercase tracking-wider lg:table-cell">
                Start
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">
                End Date
              </TableHead>
              <TableHead className="hidden text-xs font-semibold uppercase tracking-wider xl:table-cell">
                Internal Admin
              </TableHead>
              <TableHead className="text-right text-xs font-semibold uppercase tracking-wider">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stations.map((station) => {
              const alert = alertMap.get(station.subscription_id)
              return (
                <TableRow
                  key={station.subscription_id}
                  className={cn(
                    alert && alert.severity === "critical" && "bg-red-50/50 dark:bg-red-950/20",
                    alert && alert.severity === "warning" && "bg-amber-50/50 dark:bg-amber-950/20"
                  )}
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-card-foreground">
                        {station.station_nickname}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate max-w-[140px]">{station.service_location}</span>
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={station.status} />
                    {alert && (
                      <p className={cn(
                        "mt-1 text-[10px] font-semibold",
                        alert.severity === "critical" ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"
                      )}>
                        {alert.days_remaining === 0 ? "Expires today!" : `${alert.days_remaining}d left`}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {station.gps_coordinates ? (
                      <a
                        href={`https://maps.google.com/?q=${station.gps_coordinates}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary underline-offset-2 hover:underline"
                      >
                        {station.gps_coordinates}
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">--</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex flex-col gap-1">
                      <a
                        href={`mailto:${station.email}`}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        {station.email || "--"}
                      </a>
                      <a
                        href={`tel:${station.phone_number}`}
                        className="flex items-center gap-1 text-[10px] text-muted-foreground hover:underline"
                      >
                        <Phone className="h-2 w-2 shrink-0" />
                        {station.phone_number}
                      </a>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-card-foreground">
                        {station.package_name}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        NLe {station.amount_paid.toLocaleString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-xs text-muted-foreground lg:table-cell">
                    {formatDate(station.start_date)}
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "text-xs font-medium",
                      alert
                        ? alert.severity === "critical"
                          ? "text-red-600 dark:text-red-400"
                          : "text-amber-600 dark:text-amber-400"
                        : "text-card-foreground"
                    )}>
                      {formatDate(station.end_date)}
                    </span>
                  </TableCell>
                  <TableCell className="hidden text-xs text-muted-foreground xl:table-cell">
                    {station.admin_email || "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant={alert ? "default" : "outline"}
                        className={cn(
                          "h-7 gap-1 text-xs",
                          alert && "bg-primary text-primary-foreground hover:bg-primary/90"
                        )}
                        onClick={() => onRenew(station)}
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span className="hidden sm:inline">
                          {alert ? "Renew" : "Activate"}
                        </span>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-muted-foreground hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/40"
                        onClick={() => onDelete(station)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <StationDetailDialog
        station={selectedStation}
        isOpen={!!selectedStation}
        onOpenChange={(open) => !open && setSelectedStation(null)}
        alert={selectedStation ? alertMap.get(selectedStation.subscription_id) : undefined}
      />
    </div>
  )
}

function CompanyCard({
  group,
  alerts,
  onRenew,
  onDeactivate,
  onDelete,
}: {
  group: CompanyGroup
  alerts: AlertSubscription[]
  onRenew: (sub: Subscription) => void
  onDeactivate: (sub: Subscription) => void
  onDelete: (sub: Subscription) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const alertMap = new Map(alerts.map((a) => [a.subscription_id, a]))
  const isIndividual = group.customer_type === "individual"

  if (isIndividual) {
    return (
      <div
        className={cn(
          "overflow-hidden rounded-2xl border bg-card",
          group.has_alerts
            ? "border-amber-400 dark:border-amber-500/60"
            : "border-border"
        )}
      >
        <div className="flex w-full items-center justify-between gap-4 p-4 md:p-5 border-b border-border/50 bg-muted/20">
          <div className="flex min-w-0 items-center gap-3 md:gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20 md:h-11 md:w-11">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-card-foreground md:text-base">
                {group.organization_name}
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Individual Account &middot; NLe {group.total_revenue.toLocaleString()}
              </p>
            </div>
          </div>
          {group.has_alerts && (
            <Badge
              variant="outline"
              className="border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-500/60 dark:bg-amber-900/30 dark:text-amber-300"
            >
              <AlertTriangle className="mr-1 h-3 w-3" />
              Action Required
            </Badge>
          )}
        </div>

        <StationList stations={group.stations} alertMap={alertMap} onRenew={onRenew} onDelete={onDelete} customerType="individual" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-card",
        group.has_alerts
          ? "border-amber-400 dark:border-amber-500/60"
          : "border-border"
      )}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center justify-between gap-4 p-4 text-left md:p-5",
          "hover:bg-muted/50 active:bg-muted/70",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        )}
        aria-expanded={isOpen}
      >
        <div className="flex min-w-0 items-center gap-3 md:gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20 md:h-11 md:w-11">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-card-foreground md:text-base">
              {group.organization_name}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {group.total_stations} station{group.total_stations !== 1 ? "s" : ""} &middot;{" "}
              {group.active_count} active &middot; NLe {group.total_revenue.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          {group.has_alerts && (
            <Badge
              variant="outline"
              className="border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-500/60 dark:bg-amber-900/30 dark:text-amber-300"
            >
              <AlertTriangle className="mr-1 h-3 w-3" />
              <span className="hidden sm:inline">Action Required</span>
              <span className="sm:hidden">{group.alert_count}</span>
            </Badge>
          )}
          <div className="flex gap-1">
            <Badge variant="secondary" className="text-xs tabular-nums">
              {group.active_count}
              <span className="ml-0.5 hidden lg:inline">active</span>
            </Badge>
            {group.pending_count > 0 && (
              <Badge variant="secondary" className="text-xs tabular-nums">
                {group.pending_count}
                <span className="ml-0.5 hidden lg:inline">pending</span>
              </Badge>
            )}
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground",
              isOpen && "rotate-180"
            )}
            style={{ transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
          />
        </div>
      </button>

      {isOpen && (
        <div
          className="animate-accordion-down overflow-hidden border-t border-border"
        >
          <StationList stations={group.stations} alertMap={alertMap} onRenew={onRenew} onDelete={onDelete} customerType="business" />
        </div>
      )}
    </div>
  )
}

export function CompanyAccordion({
  groups,
  alerts,
  onRenew,
  onDeactivate,
  onDelete,
}: CompanyAccordionProps) {
  return (
    <div className="flex flex-col gap-3">
      {groups.map((group, i) => (
        <div
          key={group.organization_name}
          className="animate-fade-in-up"
          style={{ animationDelay: `${i * 60}ms`, animationFillMode: "backwards" }}
        >
          <CompanyCard
            group={group}
            alerts={alerts}
            onRenew={onRenew}
            onDeactivate={onDeactivate}
            onDelete={onDelete}
          />
        </div>
      ))}
      {groups.length === 0 && (
        <div className="flex h-40 items-center justify-center rounded-2xl border border-border bg-card">
          <p className="text-sm text-muted-foreground">No organizations found.</p>
        </div>
      )}
    </div>
  )
}
