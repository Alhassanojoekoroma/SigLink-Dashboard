
import { NextResponse } from 'next/server'
import { getAlerts, getNotificationEmails } from '@/lib/data'
import { sendExpirationAlert, sendadminAlert } from '@/lib/email'

// This route can be called by Vercel Cron or manually
export async function GET() {
    try {
        const alerts = await getAlerts()
        const adminEmails = await getNotificationEmails()

        // Filter for critical alerts (e.g. <= 5 days)
        // The getAlerts function already filters for <= 5 days

        let emailCount = 0

        for (const alert of alerts) {
            // Send to customer
            const customerEmail = alert.email || "customer@example.com"
            await sendExpirationAlert(
                customerEmail,
                alert.organization_name,
                alert.days_remaining,
                new Date(alert.end_date).toLocaleDateString()
            )
            console.log(`Sent customer alert to ${alert.organization_name}`)
            emailCount++

            // Send to admins
            for (const admin of adminEmails) {
                if (admin.active) {
                    await sendadminAlert(
                        admin.email,
                        alert.organization_name,
                        alert.days_remaining,
                        new Date(alert.end_date).toLocaleDateString()
                    )
                    console.log(`Sent admin alert to ${admin.email}`)
                    emailCount++
                }
            }
        }

        return NextResponse.json({ success: true, emailsSent: emailCount })
    } catch (error) {
        console.error("Error in check-alerts cron:", error)
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
    }
}
