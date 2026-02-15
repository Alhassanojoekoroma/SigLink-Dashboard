"use client"

import { useState } from "react"
import {
  Search,
  ArrowUpDown,
  SlidersHorizontal,
  Plus,
  Download,
  ChevronDown,
  Building2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TableToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  onSort: (field: string) => void
  sortField: string
  sortDirection: "asc" | "desc"
  onAddNew: () => void
  onExport: () => void
  onImport: () => void
}

export function TableToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onSort,
  sortField,
  sortDirection,
  onAddNew,
  onExport,
  onImport,
}: TableToolbarProps) {
  const [showSortMenu, setShowSortMenu] = useState(false)

  const statusLabel =
    statusFilter === "All" ? "All Organizations" : `${statusFilter} Stations`

  return (
    <div className="flex flex-col gap-3">
      {/* Top toolbar row */}
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 text-card-foreground">
              <Building2 className="h-4 w-4" />
              {statusLabel}
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {["All", "Active", "Pending", "Inactive"].map((s) => (
              <DropdownMenuItem
                key={s}
                onClick={() => onStatusFilterChange(s)}
                className={statusFilter === s ? "bg-accent" : ""}
              >
                {s === "All" ? "All Organizations" : s}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-2">
          <Button
            onClick={onAddNew}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Subscription</span>
            <span className="sm:hidden">Add</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 text-card-foreground">
                <Download className="h-4 w-4" />
                <span className="hidden md:inline">{"Import / Export"}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onImport}>
                Import from Excel / CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExport}>
                Export as CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search and sort/filter row */}
      <div className="flex items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search organizations, stations, contacts..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <DropdownMenu open={showSortMenu} onOpenChange={setShowSortMenu}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 text-card-foreground">
              <ArrowUpDown className="h-4 w-4" />
              <span className="hidden sm:inline">Sort</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {[
              { label: "Organization", value: "organization_name" },
              { label: "Customer Name", value: "customer_name" },
              { label: "Amount Paid", value: "amount_paid" },
              { label: "Start Date", value: "start_date" },
              { label: "End Date", value: "end_date" },
              { label: "Status", value: "status" },
            ].map((item) => (
              <DropdownMenuItem
                key={item.value}
                onClick={() => {
                  onSort(item.value)
                  setShowSortMenu(false)
                }}
                className={sortField === item.value ? "bg-accent" : ""}
              >
                {item.label}
                {sortField === item.value && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {sortDirection === "asc" ? "A-Z" : "Z-A"}
                  </span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 text-card-foreground">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {["All", "Active", "Pending", "Inactive"].map((s) => (
              <DropdownMenuItem
                key={s}
                onClick={() => onStatusFilterChange(s)}
                className={statusFilter === s ? "bg-accent" : ""}
              >
                {s === "All" ? "All Statuses" : s}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
