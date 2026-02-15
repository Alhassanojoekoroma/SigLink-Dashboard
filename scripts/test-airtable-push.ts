
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const airtableApiKey = process.env.AIRTABLE_API_KEY
const airtableBaseId = process.env.AIRTABLE_BASE_ID
const airtableTableName = process.env.AIRTABLE_TABLE_NAME || 'Subscriptions'

async function testAirtablePush() {
    console.log("--- Testing Airtable Record Push ---")

    const url = `https://api.airtable.com/v0/${airtableBaseId}/${airtableTableName}`
    const body = {
        records: [
            {
                fields: {
                    "Subscription ID": "TEST-123",
                    "Organization": "Test Org",
                    "Station Nickname": "TEST-STATION",
                    "Location": "Test Location",
                    "Customer Name": "Test Customer",
                    "Email": "test@example.com",
                    "Phone": "123456789",
                    "Status": "Active",
                    "Package": "Residential",
                    "Start Date": new Date().toISOString().split('T')[0],
                    "End Date": new Date().toISOString().split('T')[0],
                    "Amount": 100
                }
            }
        ]
    }

    try {
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
            console.error("❌ PUSH FAILED")
            console.error(JSON.stringify(err, null, 2))
        } else {
            console.log("✅ PUSH SUCCESSFUL")
            const data = await res.json()
            console.log("Record ID:", data.records[0].id)
        }
    } catch (error) {
        console.error("Error:", error)
    }
}

testAirtablePush()
