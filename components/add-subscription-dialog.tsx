
"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import type { Subscription } from "@/lib/data"

interface AddSubscriptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Partial<Subscription>) => void
  editData?: Subscription | null
}

const packages = [
  "Residential Lite",
  "R-Lite",
  "R=unlimited",
  "Residential",
  "Monthly",
  "Prepaid",
  "Sterling Gold 50GB",
  "Sterling Silver 25GB",
  "Sterling Bronze 10GB",
  "Sterling Platinum 100GB",
  "Sterling Diamond 200GB",
  "Sterling Basic 5GB",
]

const packagePrices: Record<string, number> = {
  "Residential Lite": 600,
  "R-Lite": 600,
  "R=unlimited": 1200,
  "Residential": 800,
  "Monthly": 1000,
  "Prepaid": 500,
  "Sterling Gold 50GB": 1500,
  "Sterling Silver 25GB": 800,
  "Sterling Bronze 10GB": 400,
  "Sterling Platinum 100GB": 3000,
  "Sterling Diamond 200GB": 5000,
  "Sterling Basic 5GB": 200,
}

const adminEmails = [
  "networksignal62@gmail.com",
  "alhassanojoek@gmail.com",
  "dejenojoe@gmail.com",
  "now52718@gmail.com",
  "timeonemore006@gmail.com"
]

export function AddSubscriptionDialog({
  open,
  onOpenChange,
  onSubmit,
  editData,
}: AddSubscriptionDialogProps) {
  const [formData, setFormData] = useState<Record<string, string>>(() =>
    editData
      ? {
        customer_type: editData.customer_type || "individual",
        organization_name: editData.organization_name,
        station_nickname: editData.station_nickname || "",
        service_location: editData.service_location,
        customer_name: editData.customer_name,
        email: editData.email || "",
        phone_number: editData.phone_number,
        gps_coordinates: editData.gps_coordinates || "",
        package_name: editData.package_name,
        amount_paid: String(editData.amount_paid),
        admin_email: editData.admin_email || adminEmails[0],
        start_date: editData.start_date.split("T")[0],
        end_date: editData.end_date.split("T")[0],
        status: editData.status,
      }
      : {
        customer_type: "individual",
        organization_name: "",
        station_nickname: "",
        service_location: "",
        customer_name: "",
        email: "",
        phone_number: "+232",
        gps_coordinates: "",
        package_name: "",
        amount_paid: "",
        admin_email: adminEmails[0],
        start_date: new Date().toISOString().split("T")[0],
        end_date: "",
        status: "Active",
      }
  )

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!formData.organization_name) newErrors.organization_name = "Required"
    if (!formData.service_location) newErrors.service_location = "Required"
    if (!formData.customer_name) newErrors.customer_name = "Required"
    if (!formData.email) newErrors.email = "Required"
    if (!formData.phone_number || formData.phone_number.length < 5)
      newErrors.phone_number = "Valid phone required"
    if (!formData.package_name) newErrors.package_name = "Required"
    if (!formData.amount_paid || Number(formData.amount_paid) <= 0)
      newErrors.amount_paid = "Must be > 0"
    if (!formData.admin_email) newErrors.admin_email = "Required"
    if (!formData.start_date) newErrors.start_date = "Required"
    if (!formData.end_date) newErrors.end_date = "Required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    const data = {
      organization_name: formData.organization_name,
      station_nickname:
        formData.station_nickname ||
        `${formData.organization_name.slice(0, 3).toUpperCase()}-NEW-01`,
      service_location: formData.service_location,
      customer_name: formData.customer_name,
      email: formData.email,
      phone_number: formData.phone_number,
      gps_coordinates: formData.gps_coordinates || null,
      package_name: formData.package_name,
      amount_paid: Number(formData.amount_paid),
      admin_email: formData.admin_email,
      start_date: new Date(formData.start_date).toISOString(),
      end_date: new Date(formData.end_date).toISOString(),
      status: formData.status as "Active" | "Pending" | "Inactive",
      customer_type: formData.customer_type as "individual" | "business",
    }

    onSubmit(data)

    toast.success("Subscription saved.")
    onOpenChange(false)
  }

  const updateField = (key: string, value: string) => {
    setFormData((prev) => {
      const next = { ...prev, [key]: value }
      if (key === "package_name" && packagePrices[value]) {
        next.amount_paid = String(packagePrices[value])
      }
      if (key === "start_date" && value) {
        // Use a robust date calculation that avoids timezone shifts
        const [year, month, day] = value.split('-').map(Number)
        const date = new Date(year, month - 1, day)
        date.setDate(date.getDate() + 30)

        // Format back to YYYY-MM-DD
        const y = date.getFullYear()
        const m = String(date.getMonth() + 1).padStart(2, '0')
        const d = String(date.getDate()).padStart(2, '0')
        next.end_date = `${y}-${m}-${d}`
      }
      return next
    })
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {editData ? "Edit Subscription" : "Add New Subscription"}
          </DialogTitle>
        </DialogHeader>

        <div className="py-2 space-y-6">

          {/* Section: Account Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider border-b pb-2">Account Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Customer Type */}
              <div className="flex flex-col gap-2">
                <Label>Account Type</Label>
                <Select
                  value={formData.customer_type}
                  onValueChange={(v) => updateField("customer_type", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="business">Business / Corporate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Org / Account Name */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <Label htmlFor="organization_name">
                  {formData.customer_type === "business" ? "Company / Organization Name" : "Account Holder Name"} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="organization_name"
                  value={formData.organization_name}
                  onChange={(e) => updateField("organization_name", e.target.value)}
                  placeholder={formData.customer_type === "business" ? "e.g. Acme Corp" : "e.g. John Doe"}
                  className="bg-muted/30"
                />
                {errors.organization_name && <p className="text-xs text-destructive">{errors.organization_name}</p>}
              </div>

              {/* Station Nickname */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="station_nickname">Station Nickname / ID</Label>
                <Input
                  id="station_nickname"
                  value={formData.station_nickname}
                  onChange={(e) => updateField("station_nickname", e.target.value)}
                  placeholder="e.g. ACME-HQ-01"
                  className="bg-muted/30"
                />
              </div>

              {/* Status */}
              <div className="flex flex-col gap-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => updateField("status", v)}
                >
                  <SelectTrigger className="bg-muted/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Starlink Admin Email */}
              <div className="flex flex-col gap-2">
                <Label>Starlink Account (Admin)</Label>
                <Select
                  value={formData.admin_email}
                  onValueChange={(v) => updateField("admin_email", v)}
                >
                  <SelectTrigger className="bg-muted/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {adminEmails.map(email => (
                      <SelectItem key={email} value={email}>{email}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.admin_email && <p className="text-xs text-destructive">{errors.admin_email}</p>}
              </div>

            </div>
          </div>

          {/* Section: Contact Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider border-b pb-2">Contact Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Customer Name */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="customer_name">Contact Person Name <span className="text-destructive">*</span></Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) => updateField("customer_name", e.target.value)}
                  className="bg-muted/30"
                />
                {errors.customer_name && <p className="text-xs text-destructive">{errors.customer_name}</p>}
              </div>

              {/* Email - NEW */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="name@company.com"
                  className="bg-muted/30"
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone_number">Phone Number <span className="text-destructive">*</span></Label>
                <Input
                  id="phone_number"
                  value={formData.phone_number}
                  onChange={(e) => updateField("phone_number", e.target.value)}
                  className="bg-muted/30"
                />
                {errors.phone_number && <p className="text-xs text-destructive">{errors.phone_number}</p>}
              </div>
            </div>
          </div>

          {/* Section: Service Location */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider border-b pb-2">Service Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2 md:col-span-2">
                <Label htmlFor="service_location">Address / Location <span className="text-destructive">*</span></Label>
                <Input
                  id="service_location"
                  value={formData.service_location}
                  onChange={(e) => updateField("service_location", e.target.value)}
                  className="bg-muted/30"
                />
                {errors.service_location && <p className="text-xs text-destructive">{errors.service_location}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="gps_coordinates">GPS Coordinates</Label>
                <Input
                  id="gps_coordinates"
                  value={formData.gps_coordinates}
                  onChange={(e) => updateField("gps_coordinates", e.target.value)}
                  className="bg-muted/30"
                />
              </div>
            </div>
          </div>

          {/* Section: Subscription Plan */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider border-b pb-2">Plan Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Package <span className="text-destructive">*</span></Label>
                <Select
                  value={formData.package_name}
                  onValueChange={(v) => updateField("package_name", v)}
                >
                  <SelectTrigger className="bg-muted/30">
                    <SelectValue placeholder="Select package" />
                  </SelectTrigger>
                  <SelectContent>
                    {packages.map((pkg) => (
                      <SelectItem key={pkg} value={pkg}>
                        {pkg}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.package_name && <p className="text-xs text-destructive">{errors.package_name}</p>}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="amount_paid">Amount Paid (NLe) <span className="text-destructive">*</span></Label>
                <Input
                  id="amount_paid"
                  type="number"
                  value={formData.amount_paid}
                  onChange={(e) => updateField("amount_paid", e.target.value)}
                  className="bg-muted/30"
                />
                {errors.amount_paid && <p className="text-xs text-destructive">{errors.amount_paid}</p>}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="start_date">Start Date <span className="text-destructive">*</span></Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => updateField("start_date", e.target.value)}
                  className="bg-muted/30"
                />
                {errors.start_date && <p className="text-xs text-destructive">{errors.start_date}</p>}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="end_date">End Date <span className="text-destructive">*</span></Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => updateField("end_date", e.target.value)}
                  className="bg-muted/30"
                />
                {errors.end_date && <p className="text-xs text-destructive">{errors.end_date}</p>}
              </div>
            </div>
          </div>

        </div>

        <DialogFooter className="gap-2 pt-4 border-t">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {editData ? "Save Changes" : "Create Subscription"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
