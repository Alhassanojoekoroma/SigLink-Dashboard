
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const airtableApiKey = process.env.AIRTABLE_API_KEY
const airtableBaseId = process.env.AIRTABLE_BASE_ID
const airtableTableName = process.env.AIRTABLE_TABLE_NAME || 'Subscriptions'

async function testAirtable() {
    console.log("--- Testing Airtable Connection ---")
    console.log("Base ID:", airtableBaseId)
    console.log("Table Name:", airtableTableName)

    if (!airtableApiKey || !airtableBaseId) {
        console.error("❌ Missing Airtable credentials in .env.local")
        return
    }

    const url = `https://api.airtable.com/v0/${airtableBaseId}/${airtableTableName}`

    try {
        // 1. Try to fetch 1 record to verify connectivity
        const res = await fetch(`${url}?maxRecords=1`, {
            headers: {
                'Authorization': `Bearer ${airtableApiKey}`
            }
        })

        if (!res.ok) {
            const err = await res.json()
            console.error(`❌ Connection failed (Status: ${res.status})`)
            console.error("Details:", JSON.stringify(err, null, 2))

            if (res.status === 404) {
                console.log("Tip: Check if the table name '" + airtableTableName + "' is correct and exists in the base.")
            }
            if (res.status === 401 || res.status === 403) {
                console.log("Tip: Check if your API Token has the correct permissions (data.records:read).")
            }
        } else {
            console.log("✅ Connection successful!")
            const data = await res.json()
            console.log(`Found ${data.records?.length || 0} records in the table.`)
        }
    } catch (error) {
        console.error("❌ Network error:", error)
    }
}

testAirtable()
