
import { Subscription } from './data'

export async function syncToAirtable(record: Subscription) {
    const airtableApiKey = process.env.AIRTABLE_API_KEY
    const airtableBaseId = process.env.AIRTABLE_BASE_ID
    const airtableTableName = process.env.AIRTABLE_TABLE_NAME || 'Subscriptions'

    if (!airtableApiKey || !airtableBaseId) {
        console.warn("Airtable sync skipped: Missing API Key or Base ID")
        return
    }

    try {
        const url = `https://api.airtable.com/v0/${airtableBaseId}/${airtableTableName}`

        // We trim the fields to the most essential ones shown in the user's screenshot
        // and ensure the format is strictly what Airtable expects (e.g. Dates as YYYY-MM-DD strings)
        const fields: Record<string, any> = {
            "Status": record.status,
            "Package": record.package_name,
            "Start Date": record.start_date.split('T')[0],
            "End Date": record.end_date.split('T')[0],
            "Amount": Number(record.amount_paid)
        }

        // Only add these if they likely exist; otherwise, we can comment them out or make them optional
        fields["Subscription ID"] = record.subscription_id
        fields["Organization"] = record.organization_name
        fields["Customer Name"] = record.customer_name
        fields["Location"] = record.service_location
        fields["Email"] = record.email || ""
        fields["Phone"] = record.phone_number

        // Only include Starlink Admin if you've added the column to Airtable
        // To avoid 422 errors, you must name the column EXACTLY "Starlink Admin"
        if (record.admin_email) {
            fields["Starlink Admin"] = record.admin_email
        }

        const body = { records: [{ fields }] }

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${airtableApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })

        if (!res.ok) {
            const err = await res.json()
            console.error("Airtable sync failed. Status:", res.status)
            console.error("Error Detail:", JSON.stringify(err, null, 2))

            // Helpful hint for the user
            if (err.error?.type === "UNKNOWN_FIELD_NAME") {
                console.log("Tip: Your Airtable table is likely missing a column. Check that all column names match exactly.")
            }
        } else {
            const data = await res.json()
            console.log("Synced to Airtable successfully. Record ID:", data.records?.[0]?.id)
        }

    } catch (error) {
        console.error("Error syncing to Airtable:", error)
    }
}
