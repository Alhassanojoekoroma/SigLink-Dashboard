
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { Resend } from 'resend'

async function testDirectResend() {
    const key = process.env.RESEND_API_KEY
    console.log("Using API Key:", key ? key.substring(0, 5) + "..." : "MISSING")

    if (!key) return

    const resend = new Resend(key)
    try {
        console.log("Sending direct test email...")
        const { data, error } = await resend.emails.send({
            from: 'SigLink <onboarding@resend.dev>',
            to: ['[banardlama101@gmail.com,]', 'alhassanojoek@gmail.com'],
            subject: 'Direct Script Test',
            html: '<p>If you see this, the API key and Resend connection are working.</p>'
        })

        if (error) {
            console.error("❌ Resend Error:", JSON.stringify(error, null, 2))
        } else {
            console.log("✅ Success! ID:", data?.id)
        }
    } catch (e) {
        console.error("❌ Execution Error:", e)
    }
}

testDirectResend()
