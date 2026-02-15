
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function debugDatabase() {
    console.log("--- Debugging Supabase ---")
    console.log("Checking project:", supabaseUrl)

    // 1. Check notification emails
    const { data: admins, error: adminErr } = await supabase.from('notification_emails').select('*')
    if (adminErr) {
        console.error("Error fetching admins:", adminErr)
    } else {
        console.log(`Found ${admins.length} notification emails:`)
        admins.forEach(a => console.log(` - ${a.email} (${a.label}) [Active: ${a.active}]`))
    }

    // 2. Check recent subscriptions
    const { data: subs, error: subErr } = await supabase.from('subscriptions').select('*').order('created_at', { ascending: false }).limit(3)
    if (subErr) {
        console.error("Error fetching subscriptions:", subErr)
    } else {
        console.log(`Found ${subs.length} recent subscriptions.`)
    }
}

debugDatabase()
