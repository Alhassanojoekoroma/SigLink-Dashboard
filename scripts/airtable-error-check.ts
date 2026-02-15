
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const airtableApiKey = process.env.AIRTABLE_API_KEY
const airtableBaseId = process.env.AIRTABLE_BASE_ID
const airtableTableName = process.env.AIRTABLE_TABLE_NAME || 'Subscriptions'

async function debug() {
    const url = `https://api.airtable.com/v0/${airtableBaseId}/${airtableTableName}`
    const body = {
        records: [{ fields: { "Subscription ID": "DEBUG" } }]
    }

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${airtableApiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })

    const data = await res.json()
    console.log("--- AIRTABLE ERROR RESPONSE ---")
    console.log(JSON.stringify(data, null, 2))
}

debug()
