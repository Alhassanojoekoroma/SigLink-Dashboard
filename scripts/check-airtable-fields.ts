
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const airtableApiKey = process.env.AIRTABLE_API_KEY
const airtableBaseId = process.env.AIRTABLE_BASE_ID
const airtableTableName = process.env.AIRTABLE_TABLE_NAME || 'Subscriptions'

async function checkAirtableSchema() {
    console.log("--- Checking Airtable Table Schema ---")

    if (!airtableApiKey || !airtableBaseId) {
        console.error("❌ Missing Airtable credentials")
        return
    }

    const url = `https://api.airtable.com/v0/${airtableBaseId}/${airtableTableName}?maxRecords=1`

    try {
        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${airtableApiKey}` }
        })

        if (!res.ok) {
            const err = await res.json()
            console.error("Failed to connect:", err)
            return
        }

        const data = await res.json()
        console.log("Successfully connected to table.")

        if (data.records && data.records.length > 0) {
            console.log("Existing record found. Field names:")
            const fields = Object.keys(data.records[0].fields)
            fields.forEach(f => console.log(` - ${f}`))
        } else {
            console.log("No records found in the table yet. I will try to list the table fields using the metadata API if possible.")
            // Metadata API requires different token scopes usually, but let's try a dry run with an empty record to see the error message which often reveals missing fields.
        }
    } catch (error) {
        console.error("Error:", error)
    }
}

checkAirtableSchema()
