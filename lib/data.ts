import { createClient, SupabaseClient } from "@supabase/supabase-js"
import { sendEmail, sendExpirationAlert, sendAdminAlert } from "@/lib/email"
import { syncToAirtable } from "@/lib/airtable"

export interface Subscription {
  subscription_id: string
  organization_name: string
  station_nickname: string
  service_location: string
  customer_name: string
  email: string
  phone_number: string
  gps_coordinates: string | null
  package_name: string
  amount_paid: number
  start_date: string
  end_date: string
  status: "Active" | "Pending" | "Inactive"
  customer_type: "business" | "individual"
  admin_email: string
  created_at: string
}

export interface AlertSubscription extends Subscription {
  days_remaining: number
  severity: "warning" | "critical"
}

export interface DashboardMetrics {
  total_revenue: number
  active_stations: number
  pending_installs: number
  urgent_alerts: number
}

export interface CompanyGroup {
  organization_name: string
  stations: Subscription[]
  total_stations: number
  active_count: number
  pending_count: number
  inactive_count: number
  total_revenue: number
  has_alerts: boolean
  alert_count: number
  customer_type: "business" | "individual"
}

let supabaseInstance: SupabaseClient | null = null

function getSupabase() {
  if (supabaseInstance) return supabaseInstance

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    // Check if we are in a build environment where these might be missing but we don't want to crash top-level
    // However, if we actually try to fetch data, we need them.
    console.warn("Supabase env vars missing. Client functionality will fail.")
    throw new Error("Supabase URL and Key must be defined")
  }

  supabaseInstance = createClient(supabaseUrl, supabaseKey)
  return supabaseInstance
}

export async function getSubscriptions(): Promise<Subscription[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching subscriptions:", error)
    return []
  }
  return data as Subscription[]
}

export async function addSubscription(
  sub: Omit<Subscription, "subscription_id" | "created_at">
): Promise<Subscription | null> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from("subscriptions")
    .insert([sub])
    .select()
    .single()

  if (error) {
    console.error("Error adding subscription:", error)
    throw error
  }

  // EMAIL TRIGGER
  try {
    const admins = await getNotificationEmails();
    console.log(`Found ${admins.length} notification recipients.`);

    // 1. Send to customer
    const customerEmail = data.email || `${data.organization_name.replace(/\s+/g, '.').toLowerCase()}@example.com`;
    await sendEmail({
      to: customerEmail,
      subject: "Welcome to SigLink - Subscription Active",
      text: `Your subscription for ${data.package_name} is now active. Station: ${data.station_nickname}. Expires on ${new Date(data.end_date).toLocaleDateString()}.`
    });

    // 2. Send to admins/IT/Finance
    for (const admin of admins) {
      if (admin.active !== false && admin.email) {
        console.log(`Sending notification to: ${admin.email} (${admin.label})`);
        // Clean up package name to remove "200GB" etc if present
        const cleanPkg = data.package_name.replace(/\d+GB/gi, '').trim();

        await sendEmail({
          to: admin.email,
          subject: `SigLink Alert: New Subscription [${data.organization_name}]`,
          text: `A new subscription has been created.\n\n` +
            `Organization: ${data.organization_name}\n` +
            `Contact: ${data.customer_name}\n` +
            `Station: ${data.station_nickname}\n` +
            `Package: ${cleanPkg}\n` +
            `Date: ${new Date(data.start_date).toLocaleDateString()}\n` +
            `Amount: NLe ${data.amount_paid}`
        });
      }
    }

  } catch (emailErr) {
    console.error("Critical error in notification loop:", emailErr);
  }

  // AIRTABLE SYNC (Always try, even if email fails)
  try {
    console.log("Starting Airtable sync...");
    await syncToAirtable(data as Subscription);
  } catch (airtableErr) {
    console.error("Critical error in Airtable sync:", airtableErr);
  }

  return data as Subscription;
}

export async function deleteSubscription(subscription_id: string): Promise<boolean> {
  const supabase = getSupabase()
  const { error } = await supabase
    .from("subscriptions")
    .delete()
    .eq("subscription_id", subscription_id)

  if (error) {
    console.error("Error deleting subscription:", error)
    return false
  }
  return true
}

export async function addNotificationEmail(email: string, label: string) {
  const supabase = getSupabase()
  const { error } = await supabase.from('notification_emails').insert({ email, label })
  if (error) throw error
}

export async function getNotificationEmails() {
  const supabase = getSupabase()
  const { data, error } = await supabase.from('notification_emails').select('*')
  if (error) return []
  return data
}

export async function deleteNotificationEmail(email: string) {
  const supabase = getSupabase()
  const { error } = await supabase.from('notification_emails').delete().eq('email', email)
  if (error) throw error
}

export async function updateSubscription(
  id: string,
  updates: Partial<Subscription>
): Promise<Subscription | null> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from("subscriptions")
    .update(updates)
    .eq("subscription_id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating subscription:", error)
    return null
  }

  // OPTIONAL: Sync to Airtable
  await syncToAirtable(data as Subscription)

  return data as Subscription
}

export async function getAlerts(): Promise<AlertSubscription[]> {
  const subs = await getSubscriptions()
  const now = new Date()
  const alerts: AlertSubscription[] = []

  for (const sub of subs) {
    if (sub.status !== "Active") continue

    if (!sub.end_date) continue

    const endDate = new Date(sub.end_date)
    const diffMs = endDate.getTime() - now.getTime()
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    if (daysRemaining <= 5) {
      alerts.push({
        ...sub,
        days_remaining: Math.max(0, daysRemaining),
        severity: daysRemaining <= 2 ? "critical" : "warning",
      })
    }
  }

  return alerts.sort((a, b) => a.days_remaining - b.days_remaining)
}

export async function getMetrics(): Promise<DashboardMetrics> {
  const subs = await getSubscriptions()
  const alerts = await getAlerts()

  return {
    total_revenue: subs
      .filter((s) => s.status === "Active")
      .reduce((sum, s) => sum + s.amount_paid, 0),
    active_stations: subs.filter((s) => s.status === "Active").length,
    pending_installs: subs.filter((s) => s.status === "Pending").length,
    urgent_alerts: alerts.length,
  }
}

export async function getDashboardData(period: "all" | "month" = "all") {
  let subs = await getSubscriptions()

  if (period === "month") {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    subs = subs.filter(s => new Date(s.start_date) >= thirtyDaysAgo)
  }

  const alerts = await getAlertsFromSubs(subs)
  const dashboardMetrics = await getMetricsFromSubs(subs, alerts)
  const companyGroups = await getCompanyGroupsFromSubs(subs, alerts)

  return {
    metrics: dashboardMetrics,
    alerts: {
      total: alerts.length,
      critical: alerts.filter(a => a.severity === 'critical').length,
      warning: alerts.filter(a => a.severity === 'warning').length,
      subscriptions: alerts
    },
    groups: companyGroups
  }
}

/**
 * Checks for expiring subscriptions and sends emails
 * Should be triggered daily (e.g., via cron or manual API call)
 */
export async function runExpirationChecks() {
  const subs = await getSubscriptions()
  const activeSubs = subs.filter(s => s.status === 'Active')
  const admins = await getNotificationEmails()

  let processedCount = 0
  let alertCount = 0

  for (const sub of activeSubs) {
    processedCount++
    const endDate = new Date(sub.end_date)
    const now = new Date()
    const diffMs = endDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    // We only care about subs expiring in 5 days or less
    if (diffDays <= 5 && diffDays >= 0) {
      alertCount++
      console.log(`Alerting for sub: ${sub.station_nickname} (${diffDays} days left)`)

      // 1. Send to Customer
      if (sub.email) {
        await sendExpirationAlert(
          sub.email,
          sub.customer_name,
          diffDays,
          endDate.toLocaleDateString(),
          sub.package_name,
          sub.station_nickname
        )
      }

      // 2. Send to Admins
      for (const admin of admins) {
        if (admin.active !== false && admin.email) {
          await sendAdminAlert(
            admin.email,
            sub.customer_name,
            diffDays,
            endDate.toLocaleDateString(),
            sub.package_name,
            sub.station_nickname
          )
        }
      }
    }
  }

  return { processedCount, alertCount }
}

// Internal helpers to process data without re-fetching
async function getAlertsFromSubs(subs: Subscription[]): Promise<AlertSubscription[]> {
  const now = new Date()
  const alerts: AlertSubscription[] = []

  for (const sub of subs) {
    if (sub.status !== "Active") continue
    if (!sub.end_date) continue

    const endDate = new Date(sub.end_date)
    const diffMs = endDate.getTime() - now.getTime()
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    if (daysRemaining <= 5) {
      alerts.push({
        ...sub,
        days_remaining: Math.max(0, daysRemaining),
        severity: daysRemaining <= 2 ? "critical" : "warning",
      })
    }
  }
  return alerts.sort((a, b) => a.days_remaining - b.days_remaining)
}

async function getMetricsFromSubs(subs: Subscription[], alerts: AlertSubscription[]): Promise<DashboardMetrics> {
  return {
    total_revenue: subs.filter(s => s.status === "Active").reduce((sum, s) => sum + s.amount_paid, 0),
    active_stations: subs.filter(s => s.status === "Active").length,
    pending_installs: subs.filter(s => s.status === "Pending").length,
    urgent_alerts: alerts.length,
  }
}

async function getCompanyGroupsFromSubs(subs: Subscription[], alerts: AlertSubscription[]): Promise<CompanyGroup[]> {
  const alertIds = new Set(alerts.map((a) => a.subscription_id))
  const map = new Map<string, Subscription[]>()

  for (const sub of subs) {
    const key = sub.organization_name || sub.customer_name || "Unknown"
    const arr = map.get(key) || []
    arr.push(sub)
    map.set(key, arr)
  }

  const groups: CompanyGroup[] = []
  for (const [orgName, stations] of map) {
    const alertCount = stations.filter((s) => alertIds.has(s.subscription_id)).length
    const isBusiness = stations.some((s) => s.customer_type === "business")

    groups.push({
      organization_name: orgName,
      stations,
      total_stations: stations.length,
      active_count: stations.filter((s) => s.status === "Active").length,
      pending_count: stations.filter((s) => s.status === "Pending").length,
      inactive_count: stations.filter((s) => s.status === "Inactive").length,
      total_revenue: stations.filter((s) => s.status === "Active").reduce((sum, s) => sum + s.amount_paid, 0),
      has_alerts: alertCount > 0,
      alert_count: alertCount,
      customer_type: isBusiness ? "business" : "individual",
    })
  }

  return groups.sort((a, b) => {
    if (a.has_alerts && !b.has_alerts) return -1
    if (!a.has_alerts && b.has_alerts) return 1
    if (a.customer_type === "business" && b.customer_type !== "business") return -1
    if (a.customer_type !== "business" && b.customer_type === "business") return 1
    return a.organization_name.localeCompare(b.organization_name)
  })
}

export async function getCompanyGroups(): Promise<CompanyGroup[]> {
  const subs = await getSubscriptions()
  const alerts = await getAlerts()
  const alertIds = new Set(alerts.map((a) => a.subscription_id))
  const map = new Map<string, Subscription[]>()

  for (const sub of subs) {
    const key = sub.organization_name || sub.customer_name || "Unknown"
    const arr = map.get(key) || []
    arr.push(sub)
    map.set(key, arr)
  }

  const groups: CompanyGroup[] = []

  for (const [orgName, stations] of map) {
    const alertCount = stations.filter((s) =>
      alertIds.has(s.subscription_id)
    ).length

    const isBusiness = stations.some((s) => s.customer_type === "business")

    groups.push({
      organization_name: orgName,
      stations,
      total_stations: stations.length,
      active_count: stations.filter((s) => s.status === "Active").length,
      pending_count: stations.filter((s) => s.status === "Pending").length,
      inactive_count: stations.filter((s) => s.status === "Inactive").length,
      total_revenue: stations
        .filter((s) => s.status === "Active")
        .reduce((sum, s) => sum + s.amount_paid, 0),
      has_alerts: alertCount > 0,
      alert_count: alertCount,
      customer_type: isBusiness ? "business" : "individual",
    })
  }

  groups.sort((a, b) => {
    if (a.has_alerts && !b.has_alerts) return -1
    if (!a.has_alerts && b.has_alerts) return 1
    if (a.customer_type === "business" && b.customer_type !== "business") return -1
    if (a.customer_type !== "business" && b.customer_type === "business") return 1
    return a.organization_name.localeCompare(b.organization_name)
  })

  return groups
}

export async function filterAndSortSubscriptions(params: {
  search?: string
  status?: string
  sort?: string
  sortDirection?: "asc" | "desc"
  page?: number
  limit?: number
}): Promise<{
  data: Subscription[]
  total: number
  page: number
  limit: number
  totalPages: number
}> {
  const supabase = getSupabase()
  const {
    search,
    status,
    sort,
    sortDirection = "desc",
    page = 1,
    limit = 14,
  } = params

  let query = supabase.from("subscriptions").select("*", { count: "exact" })

  if (status && status !== "All") {
    query = query.eq("status", status)
  }

  if (search) {
    const q = `%${search}%`
    query = query.or(`customer_name.ilike.${q},organization_name.ilike.${q},station_nickname.ilike.${q},phone_number.ilike.${q},service_location.ilike.${q}`)
  }

  if (sort) {
    query = query.order(sort, { ascending: sortDirection === "asc" })
  } else {
    query = query.order("created_at", { ascending: false })
  }

  const start = (page - 1) * limit
  const end = start + limit - 1

  const { data, count, error } = await query.range(start, end)

  if (error) {
    console.error("Error fetching subscriptions:", error)
    return { data: [], total: 0, page, limit, totalPages: 0 }
  }

  return {
    data: (data as Subscription[]) || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  }
}
