
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const airtableApiKey = process.env.AIRTABLE_API_KEY
const airtableBaseId = process.env.AIRTABLE_BASE_ID
const airtableTableName = process.env.AIRTABLE_TABLE_NAME || 'Subscriptions'

async function debugAllFields() {
    const fields = {
        "Subscription ID": "DEBUG-FULL",
        "Organization": "Debug Org",
        "Station Nickname": "Debug Station",
        "Location": "Debug Location",
        "Customer Name": "Debug Customer",
        "Email": "debug@example.com",
        "Phone": "123456",
        "Status": "Active",
        "Package": "Residential",
        "Start Date": "2024-01-01",
        "End Date": "2024-02-01",
        "Amount": 100
    }

    console.log("Testing full sync push...")

    const url = `https://api.airtable.com/v0/${airtableBaseId}/${airtableTableName}`
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${airtableApiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ records: [{ fields }] })
    })

    const data = await res.json()
    console.log("--- AIRTABLE RESPONSE ---")
    console.log(JSON.stringify(data, null, 2))
}

debugAllFields()
