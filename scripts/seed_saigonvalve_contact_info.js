const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seedContactInfo() {
    console.log('=== SEEDING SAIGONVALVE CONTACT INFO TO BACKEND DB ===');

    const settings = {
        site_address: 'Số 124/16-18 Võ Văn Hát, Long Trường, TP. Thủ Đức, TP. Hồ Chí Minh',
        site_phone: '090 695 54 59',
        site_phone_raw: '0906955459',
        site_office_phone: '(028) 3535 8739',
        site_office_phone_raw: '02835358739',
        site_email: 'info@saigonvalve.vn',
        site_support_email: 'support@saigonvalve.vn',
        site_website: 'https://saigonvalve.vn',
        site_website_label: 'saigonvalve.vn',
        site_facebook: 'https://www.facebook.com/saigon.valve.2024',
        site_zalo: 'https://zalo.me/0906955459',
        site_youtube: 'https://youtube.com/@saigonvalve',
        site_linkedin: 'https://linkedin.com/company/saigonvalve',
        site_working_hours_weekdays: '08:00 - 17:30',
        site_working_hours_saturday: '08:00 - 12:00',
        site_working_hours_sunday: 'Nghỉ',
        site_tax_code: '0313460839',
        site_founded_year: '2015',
        site_name: 'Đông Dương Corporation',
        site_short_name: 'Đông Dương',
        site_full_name: 'CÔNG TY CỔ PHẦN ĐẦU TƯ & THƯƠNG MẠI ĐÔNG DƯƠNG',
        site_slogan: 'Tổng đại lý phân phối Gạch Men & Gạch Trang Trí, Hệ Thống Máy Lạnh Điều Hòa Trung Tâm VRV - Chiller Hàng Đầu Việt Nam.',
        site_copyright_name: 'ĐÔNG DƯƠNG CORPORATION',
        site_copyright_text: 'BẢO LƯU TẤT CẢ QUYỀN.',
    };

    for (const [key, value] of Object.entries(settings)) {
        await pool.query(
            `INSERT INTO system_settings (key, value, updated_at)
             VALUES ($1, $2, NOW())
             ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
            [key, value]
        );
        console.log(`Updated setting: ${key} = ${value}`);
    }

    console.log('=== FINISHED SEEDING SAIGONVALVE CONTACT INFO ===');
    await pool.end();
}

seedContactInfo().catch((err) => {
    console.error('Error seeding contact info:', err);
    process.exit(1);
});
