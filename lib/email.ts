
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export interface EmailPayload {
    to: string
    subject: string
    text: string
    html?: string
}

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
    if (!resend) {
        console.log("-----------------------------------------")
        console.log(`[EMAIL MOCK] To: ${payload.to}`)
        console.log(`[EMAIL MOCK] Subject: ${payload.subject}`)
        console.log(`[EMAIL MOCK] Body: ${payload.text}`)
        console.log("-----------------------------------------")
        return true;
    }

    const isAlert = payload.subject.toLowerCase().includes('expiring') || payload.subject.toLowerCase().includes('alert');
    const accentColor = isAlert ? '#e11d48' : '#0033cc';
    const secondaryColor = isAlert ? '#fff1f2' : '#f5f8ff';
    const title = isAlert ? 'Subscription Alert' : 'Thank you for your purchase!';

    // Parse values from text if needed
    const packageName = payload.text.split('Package: ')[1]?.split('\n')[0]?.split('.')[0] || 'Internet Subscription';
    const amount = payload.text.split('Amount: ')[1]?.split('\n')[0] || 'NLe. --';
    const station = payload.text.split('Station: ')[1]?.split('\n')[0] || 'N/A';

    // Premium HTML Template matching Image 2
    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: 'Inter', -apple-system, sans-serif; background-color: ${accentColor}; margin: 0; padding: 40px 20px; color: #1a1a1a; }
            .container { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
            .header { padding: 40px; text-align: left; }
            .logo { font-size: 24px; font-weight: 900; color: ${accentColor}; letter-spacing: -1.5px; margin-bottom: 35px; text-transform: uppercase; }
            .order-meta { float: right; color: #999; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
            h1 { font-size: 32px; line-height: 1.1; margin: 0 0 20px 0; color: #001a66; font-weight: 900; }
            .links { margin-bottom: 30px; }
            .links a { color: ${accentColor}; text-decoration: none; font-size: 12px; font-weight: 700; margin-right: 20px; border-bottom: 2px solid ${accentColor}; padding-bottom: 4px; transition: opacity 0.2s; }
            .content { font-size: 15px; line-height: 1.6; color: #555; margin-bottom: 35px; font-weight: 500; }
            .summary { background-color: ${secondaryColor}; padding: 40px; border-radius: 0 0 20px 20px; }
            .summary-title { font-size: 13px; font-weight: 800; color: #001a66; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 25px; }
            .item-row { display: flex; justify-content: space-between; margin-bottom: 20px; align-items: center; }
            .item-info { display: flex; align-items: center; gap: 18px; }
            .item-img { width: 48px; height: 48px; background: ${isAlert ? '#fda4af' : '#ccd9ff'}; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: ${accentColor}; font-weight: 900; font-size: 20px; }
            .item-name { font-size: 16px; font-weight: 700; color: #1a1a1a; }
            .item-qty { font-size: 12px; color: #777; margin-top: 4px; font-weight: 600; }
            .divider { border-top: 1px dashed ${isAlert ? '#fecaca' : '#ccd9ff'}; margin: 30px 0; }
            .total-row { display: flex; justify-content: space-between; align-items: center; }
            .total-label { font-size: 18px; font-weight: 800; color: #001a66; }
            .total-value { font-size: 24px; font-weight: 950; color: ${accentColor}; }
            .btn { display: inline-block; background-color: ${accentColor}; color: #ffffff !important; padding: 16px 32px; border-radius: 14px; text-decoration: none; font-weight: 800; font-size: 14px; margin-top: 30px; box-shadow: 0 10px 20px rgba(0,51,204,0.15); }
            .footer { padding: 30px; text-align: center; font-size: 12px; color: #999; font-weight: 600; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <span class="order-meta">#SL-${Math.floor(Math.random() * 90000) + 10000}</span>
                <div class="logo">SigLink</div>
                <h1>${title}</h1>
                <div class="links">
                    <a href="#">Support</a>
                    <a href="#">Dashboard</a>
                </div>
                <p class="content">${payload.subject.includes('Welcome') ? "We're thrilled to have you on board! Your high-speed connection is now being provisioned and will be active shortly." : payload.text.split('\n')[0]}</p>
                
                ${!isAlert ? `<a href="#" class="btn">Download PDF Receipt</a>` : ''}
            </div>
            <div class="summary">
                <div class="summary-title">Network Details</div>
                <div class="item-row">
                    <div class="item-info">
                        <div class="item-img">${packageName[0]}</div>
                        <div>
                            <div class="item-name">${packageName}</div>
                            <div class="item-qty">Node ID: ${station}</div>
                        </div>
                    </div>
                </div>
                <div class="divider"></div>
                <div class="total-row">
                    <span class="total-label">${isAlert ? 'Package' : 'Total Paid'}</span>
                    <span class="total-value">${isAlert ? packageName : amount}</span>
                </div>
            </div>
            <div class="footer">
                &copy; 2026 SigLink Hub. Engineered for reliability.
            </div>
        </div>
    </body>
    </html>
    `;

    try {
        const { data, error } = await resend.emails.send({
            from: 'SigLink <onboarding@resend.dev>',
            to: [payload.to],
            subject: payload.subject,
            text: payload.text,
            html: payload.html || htmlTemplate,
        });

        if (error) {
            console.error("Resend Email Error:", error);
            return false;
        }

        console.log("Email sent successfully via Resend. ID:", data?.id);
        return true;
    } catch (error) {
        console.error("Resend execution error:", error);
        return false;
    }
}

export async function sendExpirationAlert(
    customerEmail: string,
    customerName: string,
    daysRemaining: number,
    expiryDate: string,
    packageName: string,
    stationNickname: string
) {
    const isToday = daysRemaining <= 0;
    const subject = isToday ? `URGENT: Your SigLink subscription ends today!` : `Action Required: Subscription Expiring in ${daysRemaining} Days`
    const text = isToday
        ? `Your subscription for ${packageName} will be ending today. If no payment is received, your internet service will be shut down at midnight.\n\nStation: ${stationNickname}\nPackage: ${packageName}`
        : `Dear ${customerName}, your subscription is expiring on ${expiryDate} (${daysRemaining} days left). Please renew every day to ensure continuous connectivity.\n\nStation: ${stationNickname}\nPackage: ${packageName}`

    await sendEmail({
        to: customerEmail,
        subject,
        text,
    })
}

export async function sendAdminAlert(
    adminEmail: string,
    customerName: string,
    daysRemaining: number,
    expiryDate: string,
    packageName: string,
    stationNickname: string
) {
    const subject = `Admin Alert: ${customerName} Subscription Expiring`
    const text = `The subscription for customer ${customerName} (Station: ${stationNickname}) is expiring on ${expiryDate} (${daysRemaining} days remaining).\n\nPackage: ${packageName}\nStation: ${stationNickname}`

    await sendEmail({
        to: adminEmail,
        subject,
        text,
    })
}

