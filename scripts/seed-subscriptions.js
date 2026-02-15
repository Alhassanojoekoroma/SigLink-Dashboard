
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const dataToSeed = [
    // networksignal62@gmail.com
    { sub: "RMFA CEO Mr M Kallon", loc: "CPM6+GW5", status: "Active", admin: "networksignal62@gmail.com" },
    { sub: "Mrs Georgiana segepoh S. Thomas - Prepaid", loc: "FQ9W+W3", status: "Active", admin: "networksignal62@gmail.com" },
    { sub: "RMFA Mr Lahai Sowa", loc: "Off Regent Road", status: "Active", admin: "networksignal62@gmail.com" },
    { sub: "Muhammad Pateh Bah - Prepaid", loc: "57 Bai Bureh Road", status: "Active", admin: "networksignal62@gmail.com" },
    { sub: "RMFA Mr Mariwan Kallon", loc: "CR58+VQ", status: "Active", admin: "networksignal62@gmail.com" },
    { sub: "Mr Josiah Bo City", loc: "W6Mm+88P", status: "Active", admin: "networksignal62@gmail.com" },
    { sub: "RMFA Mr Sakilla", loc: "39F Regent Road", status: "Active", admin: "networksignal62@gmail.com" },
    { sub: "Mr Bashirr Sheriff - Prepaid", loc: "9VXJ+XM", status: "Active", admin: "networksignal62@gmail.com" },

    // alhassanojoek@gmail.com
    { sub: "SEMCO - Sewa Ground", loc: "10 Sibthorpe St", status: "Active", admin: "alhassanojoek@gmail.com" },
    { sub: "RMFA Mariama Jalloh (Mish Home)", loc: "FQ46+7V", status: "Active", admin: "alhassanojoek@gmail.com" },
    { sub: "KONO - Pierangelo Valerio", loc: "J2PX+GF7", status: "Active", admin: "alhassanojoek@gmail.com" },
    { sub: "SEMCO Office - Makeni", loc: "Vwfx+F56", status: "Active", admin: "alhassanojoek@gmail.com" },
    { sub: "GAMBIA Roam - Bro Balajo Tel - 2203725666", loc: "Vwfx+F56", status: "Active", phone: "2203725666", admin: "alhassanojoek@gmail.com" },
    { sub: "GUMA Regent Office", loc: "Cqqg+Q6R", status: "Active", admin: "alhassanojoek@gmail.com" },
    { sub: "RMFA Ing Alie Forna - 27c Lower pipeline - 076965323", loc: "CPXF+RP", status: "Active", phone: "076965323", admin: "alhassanojoek@gmail.com" },
    { sub: "GUMA - Ishmail Bundu - 077600664", loc: "Cqqg+Q6R", status: "Active", phone: "077600664", admin: "alhassanojoek@gmail.com" },

    // dejenojoe@gmail.com
    { sub: "NPRA DDG Kobba - 23278617222", loc: "9VJC+V5H Hastings", status: "Active", phone: "23278617222", admin: "dejenojoe@gmail.com" },
    { sub: "NPRA Mr Josiah R=unlimited - 23278296126", loc: "8XHQ+M5", status: "Active", phone: "23278296126", admin: "dejenojoe@gmail.com" },
    { sub: "RMFA Mr Joe Thomas Residential - 23276159254", loc: "9RWR+M7C", status: "Active", phone: "23276159254", admin: "dejenojoe@gmail.com" },
    { sub: "RMFA Mr Mangay R-Lite - 23278263487", loc: "Location: 8.3919, -13.2542", status: "Active", phone: "23278263487", admin: "dejenojoe@gmail.com" },
    { sub: "AB Beautiful Blinds R-Lite (2207689601 / 2203725666)", loc: "Fpmr+Mf3", status: "Active", phone: "2203725666", admin: "dejenojoe@gmail.com" },
    { sub: "RMFA - Justice Moi-Samba R-Lite", loc: "Freetown", status: "Active", admin: "dejenojoe@gmail.com" },
    { sub: "RMFA Mr Clifford Williams", loc: "Fpcw+Q5V", status: "Active", admin: "dejenojoe@gmail.com" },

    // now52718@gmail.com
    { sub: "Countryside international company", loc: "CPVC+PFP", status: "Active", admin: "now52718@gmail.com" },
    { sub: "GUMA Dir Bah", loc: "FP6R+WQ5", status: "Active", admin: "now52718@gmail.com" },

    // timeonemore006@gmail.com
    { sub: "Limkokwing College", loc: "FQ26+HF2", status: "Pending", admin: "timeonemore006@gmail.com" },
    { sub: "NPRA HQ (Petroleum)", loc: "British Council Road", status: "Pending", admin: "timeonemore006@gmail.com" },
    { sub: "RMFA OFFICE HQ", loc: "FQR7+6CX", status: "Active", admin: "timeonemore006@gmail.com" },
];

async function seed() {
    console.log("Cleaning existing subscriptions...");
    await supabase.from('subscriptions').delete().neq('subscription_id', 'none');

    console.log("Starting seeding fresh data...");

    for (const item of dataToSeed) {
        const org = item.sub.includes("RMFA") ? "RMFA" :
            item.sub.includes("NPRA") ? "NPRA" :
                item.sub.includes("GUMA") ? "Guma Valley" :
                    item.sub.includes("SEMCO") ? "SEMCO" : "Individual Clients";

        const customerType = org === "Individual Clients" ? "individual" : "business";

        const subData = {
            organization_name: org,
            station_nickname: item.sub,
            service_location: item.loc,
            customer_name: item.sub.split(' - ')[0],
            email: "",
            phone_number: item.phone || "000-000-0000",
            gps_coordinates: item.loc.includes(',') && item.loc.includes('Location') ? item.loc.replace('Location: ', '') : null,
            package_name: "Standard Package",
            amount_paid: 0,
            admin_email: item.admin,
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: item.status,
            customer_type: customerType,
        };

        const { data, error } = await supabase.from('subscriptions').insert([subData]).select();
        if (error) {
            console.error(`Error inserting ${item.sub}:`, error.message);
        } else {
            console.log(`Inserted: ${item.sub}`);
        }
    }
}

seed();
