
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const packagePrices: Record<string, number> = {
    "Residential Lite": 600,
    "R-Lite": 600,
    "R=unlimited": 1200,
    "Residential": 800,
    "Monthly": 1000,
    "Prepaid": 500,
    "Sterling Gold 50GB": 1500,
    "Sterling Silver 25GB": 800,
    "Sterling Bronze 10GB": 400,
    "Sterling Platinum 100GB": 3000,
    "Sterling Diamond 200GB": 5000,
    "Sterling Basic 5GB": 200,
}

interface RawCustomer {
    org: string
    nickname: string
    location: string
    customer: string
    email: string
    phone: string
    gps: string | null
    package_name: string
    status: "Active" | "Pending" | "Inactive" | "Paused"
    type: "business" | "individual"
}

const rawCustomers: RawCustomer[] = [
    // ── Group 1: Residential / Individual ──
    { org: "NPRA", nickname: "NPRA-DDG-01", location: "9VJC+V5H Hastings", customer: "Kobba", email: "kobba@npra.gov.sl", phone: "23278617222", gps: null, package_name: "Residential Lite", status: "Active", type: "business" },
    { org: "NPRA", nickname: "NPRA-HQ-01", location: "British Council Road", customer: "Mr Josiah", email: "josiah@npra.gov.sl", phone: "23278296126", gps: "8.4840, -13.2340", package_name: "R=unlimited", status: "Active", type: "business" },
    { org: "RMFA", nickname: "RMFA-JThomas-01", location: "9RWR+M7C", customer: "Mr Joe Thomas", email: "j.thomas@rmfa.gov.sl", phone: "+23276159254", gps: null, package_name: "Residential", status: "Active", type: "business" },
    { org: "RMFA", nickname: "RMFA-Mangay-02", location: "8.3919, -13.2542", customer: "Mr Mangay", email: "mangay@rmfa.gov.sl", phone: "23278263487", gps: "8.3919, -13.2542", package_name: "R-Lite", status: "Active", type: "business" },
    { org: "RMFA", nickname: "RMFA-MoiSamba-03", location: "Freetown", customer: "Justice Moi-Samba", email: "moi-samba@judiciary.gov.sl", phone: "+23276000001", gps: null, package_name: "R-Lite", status: "Active", type: "business" },
    { org: "RMFA", nickname: "RMFA-Clifford-04", location: "Fpcw+Q5V", customer: "Mr Clifford Williams", email: "c.williams@rmfa.gov.sl", phone: "+23276000002", gps: null, package_name: "Residential", status: "Active", type: "business" },
    { org: "RMFA", nickname: "RMFA-HQ-05", location: "FQR7+6CX", customer: "RMFA Office HQ", email: "info@rmfa.gov.sl", phone: "+23276000003", gps: null, package_name: "Sterling Platinum 100GB", status: "Active", type: "business" },
    { org: "RMFA", nickname: "RMFA-Mish-06", location: "FQ46+7V", customer: "Mariama Jalloh (Mish Home)", email: "m.jalloh@example.com", phone: "+23276000004", gps: null, package_name: "Residential", status: "Active", type: "business" },
    { org: "RMFA", nickname: "RMFA-AlieForna-07", location: "CPXF+RP", customer: "Ing Alie Forna", email: "a.forna@rmfa.gov.sl", phone: "076965323", gps: null, package_name: "Residential", status: "Active", type: "business" },
    { org: "RMFA", nickname: "RMFA-CEO-08", location: "CPM6+GW5", customer: "CEO Mr M Kallon", email: "ceo@rmfa.gov.sl", phone: "+23276000005", gps: null, package_name: "Sterling Gold 50GB", status: "Active", type: "business" },
    { org: "RMFA", nickname: "RMFA-LahaiSowa-09", location: "Off Regent Road", customer: "Mr Lahai Sowa", email: "l.sowa@rmfa.gov.sl", phone: "+23276000006", gps: null, package_name: "Residential", status: "Active", type: "business" },
    { org: "RMFA", nickname: "RMFA-Mariwan-10", location: "CR58+VQ", customer: "Mr Mariwan Kallon", email: "m.kallon@rmfa.gov.sl", phone: "+23276000007", gps: null, package_name: "Residential", status: "Active", type: "business" },
    { org: "RMFA", nickname: "RMFA-Sakilla-11", location: "39F Regent Road", customer: "Mr Sakilla", email: "sakilla@rmfa.gov.sl", phone: "+23276000008", gps: null, package_name: "Residential", status: "Active", type: "business" },
    { org: "AB Beautiful Blinds", nickname: "ABB-01", location: "Fpmr+Mf3", customer: "AB Beautiful Blinds", email: "info@beautifulblinds.sl", phone: "2207689601", gps: null, package_name: "R-Lite", status: "Active", type: "business" },
    { org: "Limkokwing College", nickname: "Limko-01", location: "FQ26+HF2", customer: "Limkokwing College", email: "admin@limkokwing.edu.sl", phone: "+23276000009", gps: null, package_name: "Sterling Platinum 100GB", status: "Active", type: "business" },
    { org: "Semco", nickname: "Semco-Sewa-01", location: "10 Sibthorpe St", customer: "Semco - Sewa Ground", email: "sewa@semco.sl", phone: "+23276000010", gps: null, package_name: "Sterling Gold 50GB", status: "Active", type: "business" },
    { org: "Semco", nickname: "Semco-Makeni-02", location: "Vwfx+F56", customer: "Semco Office - Makeni", email: "makeni@semco.sl", phone: "+23276000011", gps: null, package_name: "Sterling Silver 25GB", status: "Active", type: "business" },
    { org: "Guma", nickname: "Guma-Regent-01", location: "Cqqg+Q6R", customer: "Guma Regent Office", email: "regent@guma.gov.sl", phone: "+23276000012", gps: null, package_name: "Sterling Gold 50GB", status: "Active", type: "business" },
    { org: "Guma", nickname: "Guma-LahaiKanu-02", location: "Cqqg+Q6R", customer: "Lahai Kanu", email: "l.kanu@guma.gov.sl", phone: "076644369", gps: null, package_name: "Sterling Silver 25GB", status: "Active", type: "business" },
    // ── Individuals (standalone, not businesses) ──
    { org: "Pierangelo Valerio", nickname: "PV-Kono-01", location: "J2PX+GF7 Kono", customer: "Pierangelo Valerio", email: "p.valerio@example.com", phone: "+23276000013", gps: null, package_name: "Residential", status: "Active", type: "individual" },
    { org: "Gambia Roam", nickname: "GR-Balajo-01", location: "Vwfx+F56", customer: "Mr Balajo", email: "balajo@example.com", phone: "2203725666", gps: null, package_name: "Residential", status: "Active", type: "individual" },
    { org: "Mrs Georgiana S. Thomas", nickname: "GST-01", location: "FQ9W+W3", customer: "Mrs Georgiana Segepoh S. Thomas", email: "g.thomas@example.com", phone: "+23276000014", gps: null, package_name: "Residential", status: "Active", type: "individual" },
    { org: "Muhammad Pateh Bah", nickname: "MPB-01", location: "57 Bai Bureh Road", customer: "Muhammad Pateh Bah", email: "m.p.bah@example.com", phone: "+23276000015", gps: null, package_name: "Monthly", status: "Active", type: "individual" },
    { org: "Mr Josiah Bo City", nickname: "JBC-01", location: "W6Mm+88P Bo City", customer: "Mr Josiah", email: "josiah.bo@example.com", phone: "+23276000016", gps: null, package_name: "Residential", status: "Active", type: "individual" },
    { org: "Mr Bashirr Sheriff", nickname: "BS-01", location: "9VXJ+XM", customer: "Mr Bashirr Sheriff", email: "b.sheriff@example.com", phone: "+23276000017", gps: null, package_name: "Prepaid", status: "Active", type: "individual" },
]

async function seedData() {
    console.log('Seeding data...')

    const now = new Date()
    let alertCounter = 0

    for (const raw of rawCustomers) {
        const price = packagePrices[raw.package_name] || 800
        const startDate = new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
        let endDate: Date

        // Inject alerts: first 8 active get close-to-expiry end dates
        const status = raw.status === "Paused" ? "Inactive" : raw.status
        if (alertCounter < 8 && status === "Active") {
            const daysRemaining = Math.floor(Math.random() * 6)
            endDate = new Date(now)
            endDate.setDate(endDate.getDate() + daysRemaining)
            alertCounter++
        } else {
            endDate = new Date(startDate)
            endDate.setMonth(endDate.getMonth() + Math.floor(Math.random() * 12) + 1)
        }

        const { error } = await supabase.from('subscriptions').insert({
            organization_name: raw.org,
            station_nickname: raw.nickname,
            service_location: raw.location,
            customer_name: raw.customer,
            email: raw.email,
            phone_number: raw.phone.startsWith("+") ? raw.phone : `+${raw.phone}`,
            gps_coordinates: raw.gps,
            package_name: raw.package_name,
            amount_paid: price,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            status,
            customer_type: raw.type,
            created_at: startDate.toISOString(),
        })

        if (error) {
            console.error('Error inserting:', raw.customer, error.message)
        } else {
            console.log('Inserted:', raw.customer)
        }
    }
}

seedData()
