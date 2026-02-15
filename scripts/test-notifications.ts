
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { addSubscription, getNotificationEmails } from '../lib/data'

async function testEmailFlow() {
    console.log("Starting Email Flow Test...")

    try {
        // 1. Check if we have notification emails
        const admins = await getNotificationEmails()
        console.log(`Found ${admins.length} admin(s) in database.`)

        // 2. Add a test subscription
        const testSub = {
            organization_name: "Test Corp",
            station_nickname: "TEST-001",
            service_location: "Test St, Freetown",
            customer_name: "Test User",
            email: "customer-test@example.com",
            phone_number: "+23200000000",
            gps_coordinates: "8.484, -13.234",
            package_name: "Residential",
            amount_paid: 800,
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: "Active" as const,
            customer_type: "business" as const,
        }

        console.log("Submitting test subscription...")
        const result = await addSubscription(testSub)

        if (result) {
            console.log("✅ Subscription added successfully.")
            console.log("Check the console logs above for the [EMAIL MOCK] lines.")
        }

    } catch (error) {
        console.error("❌ Test failed:", error)
    }
}

testEmailFlow()
