/**
 * Thông tin công ty - Chỉnh sửa tại đây sẽ cập nhật toàn bộ website
 */

export const COMPANY_INFO = {
    name: 'Sài Gòn Valve',
    shortName: 'SGV',
    fullName: 'CÔNG TY TNHH SÀI GÒN VALVE',

    // Địa chỉ
    address: 'Số 124/16-18 Võ Văn Hát, Long Trường, TP. Thủ Đức, TP. Hồ Chí Minh',

    // Liên hệ
    phone: process.env.NEXT_PUBLIC_COMPANY_HOTLINE || '090 695 54 59',
    phoneRaw: process.env.NEXT_PUBLIC_COMPANY_HOTLINE_RAW || '0906955459', // Dùng cho href tel:
    hotline: process.env.NEXT_PUBLIC_COMPANY_HOTLINE || '090 695 54 59',
    hotlineRaw: process.env.NEXT_PUBLIC_COMPANY_HOTLINE_RAW || '0906955459',

    email: process.env.NEXT_PUBLIC_COMPANY_EMAIL || 'info@saigonvalve.vn',
    supportEmail: 'support@saigonvalve.vn',

    // Website
    website: 'https://saigonvalve.vn',

    // Mạng xã hội
    social: {
        facebook: process.env.NEXT_PUBLIC_COMPANY_FACEBOOK || 'https://www.facebook.com/saigon.valve.2024',
        linkedin: 'https://linkedin.com/company/saigonvalve',
        youtube: 'https://youtube.com/@saigonvalve',
        zalo: process.env.NEXT_PUBLIC_COMPANY_ZALO || 'https://zalo.me/0906955459',
    },

    // Giờ làm việc
    workingHours: {
        weekdays: '08:00 - 17:30',
        saturday: '08:00 - 12:00',
        sunday: 'Nghỉ',
    },

    // Thông tin pháp lý
    taxCode: '0123456789',
    foundedYear: 2015,

    // Slogan / Mô tả
    slogan: 'Nhà phân phối độc quyền thiết bị ngành nước và giải pháp quan trắc thông minh từ Nhật Bản & Hàn Quốc tại thị trường Việt Nam.',

    // Copyright
    copyright: `© ${new Date().getFullYear()} SÀI GÒN VALVE. BẢO LƯU TẤT CẢ QUYỀN.`,
} as const;

export type CompanyInfo = typeof COMPANY_INFO;
