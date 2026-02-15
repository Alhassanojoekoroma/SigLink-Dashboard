
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function seedNotificationEmails() {
    const emails = [
        { email: 'dejen638@gmail.com', label: 'IT Support', active: true },
        { email: 'boss@siglink.com', label: 'CEO / Boss', active: true },
        { email: 'finance@siglink.com', label: 'Finance Manager', active: true }
    ]

    console.log("Seeding notification emails...")

    for (const item of emails) {
        const { error } = await supabase
            .from('notification_emails')
            .upsert(item, { onConflict: 'email' })

        if (error) {
            console.error(`Error for ${item.email}:`, error)
        } else {
            console.log(`✅ ${item.label} (${item.email}) added/updated.`)
        }
    }
}

seedNotificationEmails()
