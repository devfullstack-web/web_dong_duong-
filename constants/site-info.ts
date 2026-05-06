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
    phone: '(028) 3535 8739',
    phoneRaw: '02835358739', // Dùng cho href tel:
    hotline: '0901 234 567',
    hotlineRaw: '0901234567',

    email: 'info@saigonvalve.vn',
    supportEmail: 'support@saigonvalve.vn',

    // Website
    website: 'https://saigonvalve.vn',

    // Mạng xã hội
    social: {
        facebook: 'https://www.facebook.com/saigon.valve.2024',
        linkedin: 'https://linkedin.com/company/saigonvalve',
        youtube: 'https://youtube.com/@saigonvalve',
        zalo: 'https://zalo.me/saigonvalve',
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
