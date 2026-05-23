import 'dotenv/config';
import { db } from './index';
import {
    categoryTypes,
    categories,
    authors,
    users,
    products,
    roles,
    modules,
    permissions,
    user_roles,
    newsArticles,
    projects,
} from './schema';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { AUTH, SEED_DEFAULTS } from '@/constants/app';
import { COMPANY_INFO } from '@/constants/site-info';
import { SIDEBAR_ITEMS } from '@/constants/sidebar';
import { MODULE_CODES } from '@/constants/rbac';

async function main() {
    console.log('Seeding database...');

    // 1. Seed Modules — derived from MODULE_CODES + SIDEBAR_ITEMS (single source of truth)
    const sidebarMap = new Map(SIDEBAR_ITEMS.map((s) => [s.code, s]));

    const appModules = Object.values(MODULE_CODES).map((code, index) => {
        const sidebar = sidebarMap.get(code);
        return {
            code,
            name: sidebar?.name ?? code,
            icon: sidebar?.icon ?? null,
            route: sidebar?.route ?? null,
            order: index,
        };
    });

    for (const moduleData of appModules) {
        const existing = await db.select().from(modules).where(eq(modules.code, moduleData.code));
        if (existing.length === 0) {
            await db.insert(modules).values(moduleData);
            console.log(`Added module: ${moduleData.code}`);
        } else {
            // Update existing module to ensure icon, route, order are correct
            await db.update(modules).set(moduleData).where(eq(modules.code, moduleData.code));
            console.log(`Updated module: ${moduleData.code}`);
        }
    }

    console.log('Modules seeded/updated. Seeding roles...');
    const allModules = await db.select().from(modules);
    // 2. Seed Roles
    const appRoles = [
        {
            code: 'SUPER_ADMIN',
            name: 'Super Administrator',
            description: 'System owner with full access',
        },
        { code: 'ADMIN', name: 'Administrator', description: 'Staff with management access' },
    ];

    for (const roleData of appRoles) {
        const existing = await db.select().from(roles).where(eq(roles.code, roleData.code));
        if (existing.length === 0) {
            await db.insert(roles).values(roleData);
            console.log(`Added role: ${roleData.code}`);
        }
    }

    const allRoles = await db.select().from(roles);
    const superAdminRole = allRoles.find((r) => r.code === 'SUPER_ADMIN');

    // 3. Seed Permissions for SUPER_ADMIN
    if (superAdminRole) {
        for (const moduleItem of allModules) {
            const existing = await db
                .select()
                .from(permissions)
                .where(
                    and(
                        eq(permissions.role_id, superAdminRole.id),
                        eq(permissions.module_id, moduleItem.id),
                    ),
                );

            if (existing.length === 0) {
                await db.insert(permissions).values({
                    role_id: superAdminRole.id,
                    module_id: moduleItem.id,
                    can_view: true,
                    can_create: true,
                    can_update: true,
                    can_delete: true,
                });
            }
        }
        console.log('Seeded permissions for SUPER_ADMIN');
    }

    console.log('Roles seeded. Seeding category types...');
    // 4. Seed Category Types
    const types = ['news', 'product', 'project'];
    for (const typeName of types) {
        const existing = await db
            .select()
            .from(categoryTypes)
            .where(eq(categoryTypes.name, typeName));
        if (existing.length === 0) {
            await db.insert(categoryTypes).values({ name: typeName });
            console.log(`Added category type: ${typeName}`);
        }
    }

    // Get types for reference
    const allTypes = await db.select().from(categoryTypes);
    const newsType = allTypes.find((t) => t.name === 'news');
    const productType = allTypes.find((t) => t.name === 'product');
    const projectType = allTypes.find((t) => t.name === 'project');

    console.log('Category types seeded. Seeding categories...');
    // 5. Seed Initial Categories
    const existingCats = await db.select().from(categories);
    if (existingCats.length === 0) {
        if (newsType) {
            const newsCats = ['Tin tức chung', 'Sự kiện công ty', 'Kiến thức kỹ thuật'];
            for (const catName of newsCats) {
                await db
                    .insert(categories)
                    .values({ name: catName, category_type_id: newsType.id });
            }
        }

        if (productType) {
            const productCats = ['Van Công Nghiệp', 'Thiết Bị Đo', 'Phụ kiện IoT', 'Bộ Điều Khiển'];
            for (const catName of productCats) {
                await db
                    .insert(categories)
                    .values({ name: catName, category_type_id: productType.id });
            }
        }

        if (projectType) {
            const projectCats = ['Hệ Thống Cấp Nước', 'Xử Lý Nước Thải', 'Tự động hóa'];
            for (const catName of projectCats) {
                await db
                    .insert(categories)
                    .values({ name: catName, category_type_id: projectType.id });
            }
        }
        console.log('Seeded categories');
    } else if (productType) {
        // Ensure "Bộ Điều Khiển" exists even if other categories were already seeded
        const boDieuKhien = existingCats.find(
            (c) => c.name === 'Bộ Điều Khiển' && c.category_type_id === productType.id,
        );
        if (!boDieuKhien) {
            await db
                .insert(categories)
                .values({ name: 'Bộ Điều Khiển', category_type_id: productType.id });
            console.log('Added missing category: Bộ Điều Khiển');
        }
    }

    // 6. Seed Default Author
    const existingAuthor = await db.select().from(authors).where(eq(authors.name, 'Admin'));
    if (existingAuthor.length === 0) {
        await db.insert(authors).values({ name: 'Admin', role: 'Administrator' });
        console.log('Added default author: Admin');
    }

    // 7. Seed Default Users
    const usersToSeed = [
        {
            username: SEED_DEFAULTS.ADMIN_USERNAME,
            password: SEED_DEFAULTS.ADMIN_PASSWORD,
            fullName: 'Administrator',
            roleCode: 'ADMIN',
        },
        {
            username: SEED_DEFAULTS.SUPER_ADMIN_USERNAME,
            password: SEED_DEFAULTS.SUPER_ADMIN_PASSWORD,
            fullName: 'Super Administrator',
            isSuper: true,
        },
    ];

    for (const userData of usersToSeed) {
        let userRecord = (
            await db.select().from(users).where(eq(users.username, userData.username!))
        )[0];
        if (!userRecord) {
            const hashedPassword = await bcrypt.hash(userData.password!, AUTH.BCRYPT_SALT_ROUNDS);
            const [inserted] = await db
                .insert(users)
                .values({
                    username: userData.username!,
                    email:
                        userData.username === SEED_DEFAULTS.SUPER_ADMIN_USERNAME
                            ? COMPANY_INFO.email
                            : `${userData.username}@saigonvalve.vn`,
                    password: hashedPassword,
                    full_name: userData.fullName,
                    is_super: userData.isSuper || false,
                    is_active: true,
                    is_locked: false,
                })
                .returning();
            userRecord = inserted;
            console.log(`Added user: ${userData.username} / ${userData.password}`);
        }

        // Link user to role if roleCode is provided
        const roleRecord = userData.roleCode
            ? allRoles.find((r) => r.code === userData.roleCode)
            : null;
        if (userRecord && roleRecord) {
            const existingUserRole = await db
                .select()
                .from(user_roles)
                .where(
                    and(
                        eq(user_roles.user_id, userRecord.id),
                        eq(user_roles.role_id, roleRecord.id),
                    ),
                );

            if (existingUserRole.length === 0) {
                await db.insert(user_roles).values({
                    user_id: userRecord.id,
                    role_id: roleRecord.id,
                });
                console.log(`Linked ${userData.username} to ${userData.roleCode} role`);
            }
        }
    }

    console.log('Users seeded. Seeding detailed products...');
    // 8. Seed Detailed Products
    if (productType) {
        const allCats = await db.select().from(categories);
        const productsData = [
            {
                id: '369c94a1-d7c6-4ec7-97fd-6ef80a94d66c',
                name: 'VAN XẢ KHÍ ĐƠN/ĐÔI ARITA',
                slug: 'van-xa-khi-arita',
                price: '0.00',
                sku: 'ARITA-AV-01',
                stock: 50,
                status: 'active' as const,
                image_url: 'https://saigonvalve.vn/uploads/files/2025/03/19/VAN-C-NG-TL.png',
                is_featured: false,
                tech_specs: {
                    Dạng: 'Đơn / Đôi',
                    'Áp lực': '16 bar',
                    'Kích thước': 'DN25 - DN200',
                },
                features: [
                    'Phao bọc nhựa cao cấp',
                    'Thân gang siêu dày',
                    'Tự động vận hành theo túi khí',
                ],
                gallery: ['/uploads/images/2026/1768638791943-locxot.png'],
                tech_summary: 'Thiết bị bảo vệ quan trọng cho các tuyến đường ống cấp nước đi xa.',
                catalog_url: '',
                warranty: '12 tháng',
                origin: 'Arita Taiwan',
                availability: 'Sẵn hàng tại kho HCM',
                delivery_info: 'Toàn quốc (2-3 ngày)',
                category: 'Van Công Nghiệp',
            },
            {
                id: '26b599b4-b622-4265-aa9a-6a86c65b47ce',
                name: 'BỘ GIÁM SÁT KÊNH HỞ SGV-ULM-50',
                slug: 'bo-giam-sat-kenh-ho-sgv-ulm-50',
                price: '0.00',
                sku: 'SGV-ULM-50',
                stock: 50,
                status: 'active' as const,
                image_url: 'https://saigonvalve.vn/uploads/files/2024/11/14/DATALOGGER.png',
                is_featured: false,
                tech_specs: {
                    'Sai số': '0.3%',
                    'Dải đo m': '0-4m',
                    'Công nghệ': 'Siêu âm',
                },
                features: [
                    'Không tiếp xúc tránh ăn mòn',
                    'Màn hình hiển thị tại chỗ',
                    'Tích hợp Datalogger lưu trữ dữ liệu',
                ],
                gallery: null,
                tech_summary:
                    'Tính toán lưu lượng dựa trên mức nước qua máng đo tiêu chuẩn Parshall/V-notch.',
                catalog_url: null,
                warranty: '12 tháng',
                origin: 'SGV Solution',
                availability: 'Sẵn hàng tại kho HCM',
                delivery_info: 'Toàn quốc (2-3 ngày)',
                category: 'Thiết Bị Đo',
            },
            {
                id: 'ee7bf894-a1b9-43e8-b45d-870fa20dbab6',
                name: 'VAN Y-STRAINER ARITA GANG',
                slug: 'van-y-strainer-arita-gang',
                price: '0.00',
                sku: 'ARITA-YS-01',
                stock: 50,
                status: 'active' as const,
                image_url: 'https://saigonvalve.vn/uploads/files/2025/03/19/VAN-C-NG-TL.png',
                is_featured: false,
                tech_specs: {
                    'Áp lực': 'PN16',
                    'Mặt bích': 'DIN/BS',
                    'Kiểu dáng': 'Chữ Y',
                },
                features: [
                    'Vật liệu gang dẻo chịu nhiệt',
                    'Mặt bích tiêu chuẩn quốc tế',
                    'Lưới lọc thép không gỉ',
                ],
                gallery: null,
                tech_summary: 'Lưới lọc inox lỗ nhỏ, dễ dàng tháo vệ sinh lưới lọc.',
                catalog_url: null,
                warranty: '12 tháng',
                origin: 'Arita Taiwan',
                availability: 'Sẵn hàng tại kho HCM',
                delivery_info: 'Toàn quốc (2-3 ngày)',
                category: 'Van Công Nghiệp',
            },
            {
                id: 'ba38e9cc-10aa-42f7-a867-394e2fc6fb58',
                name: 'CẢM BIẾN COD ONLINE SGV-COD-200',
                slug: 'cam-bien-cod-online-sgv-cod-200',
                price: '0.00',
                sku: 'SGV-COD-200',
                stock: 50,
                status: 'active' as const,
                image_url: 'https://saigonvalve.vn/uploads/files/2024/11/14/-c.png',
                is_featured: true,
                tech_specs: {
                    'Dải đo': '0-1000 mg/L',
                    'Nguyên lý': 'Hấp thụ UV254',
                    'Cấp bảo vệ': 'IP68',
                },
                features: [
                    'Không tiêu tốn hóa chất',
                    'Kết quả tức thời',
                    'Hệ thống tự làm sạch thấu kính',
                ],
                gallery: null,
                tech_summary:
                    'Sử dụng tia cực tím UV để xác định nồng độ chất hữu cơ trong nước thải.',
                catalog_url: null,
                warranty: '12 tháng',
                origin: 'SGV Solution',
                availability: 'Sẵn hàng tại kho HCM',
                delivery_info: 'Toàn quốc (2-3 ngày)',
                category: 'Thiết Bị Đo',
            },
            {
                id: '4b277c75-97f1-40bb-88e9-24df1f92ede9',
                name: 'BỘ ĐIỀU KHIỂN KHÍ NÉN NOAH SERIES NP',
                slug: 'bo-dieu-khien-khi-nen-noah-np',
                price: '0.00',
                sku: 'NOAH-PA-01',
                stock: 50,
                status: 'active' as const,
                image_url:
                    'https://saigonvalve.vn/uploads/files/2025/04/17/thumbs/IOT-306x234-5.png',
                is_featured: false,
                tech_specs: {
                    Thân: 'Hợp kim nhôm',
                    'Góc quay': '90 độ',
                    'Áp lực khí nén': '5-8 bar',
                },
                features: [
                    'Thời gian đóng mở <1 giây',
                    'Có tùy chọn Single Acting (Spring Return)',
                    'Tích hợp giới hạn hành trình',
                ],
                gallery: null,
                tech_summary:
                    'Pneumatic Actuator kiểu Rack & Pinion, thân nhôm anodized chống ăn mòn.',
                catalog_url: null,
                warranty: '24 tháng',
                origin: 'NOAH Korea',
                availability: 'Sẵn hàng tại kho HCM',
                delivery_info: 'Toàn quốc (2-3 ngày)',
                category: 'Bộ Điều Khiển',
            },
            {
                id: '22858736-2f1a-4508-8d04-494da72f4bfc',
                name: 'VAN MỘT CHIỀU CÁNH LẬT OKM',
                slug: 'van-mot-chieu-canh-lat-okm',
                price: '0.00',
                sku: 'OKM-CV-01',
                stock: 50,
                status: 'active' as const,
                image_url: 'https://saigonvalve.vn/uploads/files/2025/03/19/VAN-C-NG-TL.png',
                is_featured: false,
                tech_specs: {
                    'Áp lực': '10 bar / 16 bar',
                    'Kiểu lắp': 'Mặt bích',
                    'Tiêu chuẩn': 'JIS/ANSI',
                },
                features: [
                    'Mặt đế làm kín cao su EPDM',
                    'Thân gang phủ sơn Epoxy',
                    'Hoạt động tự động theo áp suất dòng',
                ],
                gallery: null,
                tech_summary: 'Cấu tạo đơn giản, tin cậy, làm việc ổn định trong thời gian dài.',
                catalog_url: null,
                warranty: '24 tháng',
                origin: 'OKM Japan',
                availability: 'Sẵn hàng tại kho HCM',
                delivery_info: 'Toàn quốc (2-3 ngày)',
                category: 'Van Công Nghiệp',
            },
            {
                id: 'e5c859d1-c3f5-4567-9a3d-67bf368f7927',
                name: 'CẢM BIẾN pH SMART SGV-PH100',
                slug: 'cam-bien-ph-smart-sgv-ph100',
                price: '0.00',
                sku: 'SGV-PH100',
                stock: 50,
                status: 'active' as const,
                image_url: 'https://saigonvalve.vn/uploads/files/2024/11/14/-c.png',
                is_featured: false,
                tech_specs: {
                    'Dải đo': '0-14 pH',
                    'Áp lực': 'max 6 bar',
                    'Nhiệt độ': '0-60°C',
                },
                features: [
                    'Tự động bù trừ nhiệt độ',
                    'Đầu đo có thể thay thế rời',
                    'Kết nối trực tiếp PLC',
                ],
                gallery: null,
                tech_summary:
                    'Cảm biến pH kỹ thuật số, đầu ra Modbus, lắp đặt ngâm chìm hoặc vào đường ống.',
                catalog_url: null,
                warranty: '12 tháng',
                origin: 'SGV Solution',
                availability: 'Sẵn hàng tại kho HCM',
                delivery_info: 'Toàn quốc (2-3 ngày)',
                category: 'Thiết Bị Đo',
            },
            {
                id: '025ccb24-5d20-4349-bb3f-4a9a3c1bbaa6',
                name: 'ĐỒNG HỒ ĐO LƯU LƯỢNG ĐIỆN TỪ MC',
                slug: 'dong-ho-do-luu-luong-dien-tu-mc',
                price: '0.00',
                sku: 'SGV-EMF-01',
                stock: 50,
                status: 'active' as const,
                image_url: 'https://saigonvalve.vn/uploads/files/2024/11/14/DATALOGGER.png',
                is_featured: true,
                tech_specs: {
                    Nguồn: 'Pin hoặc 220V',
                    'Lớp lót': 'Hard Rubber / PTFE',
                    'Điện cực': 'SS316L / Hastelloy',
                },
                features: [
                    'Sai số siêu thấp ±0.5%',
                    'Có khả năng đo dòng chảy hai chiều',
                    'Không gây tổn thất áp suất',
                ],
                gallery: null,
                tech_summary: 'Sử dụng nguyên lý Faraday để đo lưu lượng chất lỏng có độ dẫn điện.',
                catalog_url: null,
                warranty: '18 tháng',
                origin: 'SGV Solution',
                availability: 'Sẵn hàng tại kho HCM',
                delivery_info: 'Toàn quốc (2-3 ngày)',
                category: 'Thiết Bị Đo',
            },
            {
                id: '0250953b-6700-484b-8d6d-5e76ee67c576',
                name: 'VAN CỔNG TY CHÌM ARITA',
                slug: 'van-cong-ty-chim-arita',
                price: '0.00',
                sku: 'ARITA-GV-01',
                stock: 50,
                status: 'active' as const,
                image_url: 'https://saigonvalve.vn/uploads/files/2025/03/19/VAN-C-NG-TL.png',
                is_featured: false,
                tech_specs: {
                    'Áp lực': 'PN16',
                    'Kết nối': 'Mặt bích',
                    'Tiêu chuẩn': 'BS 5163',
                },
                features: [
                    'Cánh van bọc cao su chịu lực',
                    'Tiêu chuẩn BS 5163',
                    'Vận hành nhẹ nhàng',
                ],
                gallery: null,
                tech_summary:
                    'Thân gang dẻo sơn epoxy tĩnh điện chống rỉ sét môi trường ngoài trời.',
                catalog_url: null,
                warranty: '24 tháng',
                origin: 'Arita Taiwan',
                availability: 'Sẵn hàng tại kho HCM',
                delivery_info: 'Toàn quốc (2-3 ngày)',
                category: 'Van Công Nghiệp',
            },
            {
                id: 'bb9c7f1e-dca1-412a-a87c-88266173d933',
                name: 'CẢM BIẾN ÁP SUẤT SGV-P10',
                slug: 'cam-bien-ap-suat-sgv-p10',
                price: '0.00',
                sku: 'SGV-P10',
                stock: 50,
                status: 'active' as const,
                image_url: 'https://saigonvalve.vn/uploads/files/2024/11/14/-c.png',
                is_featured: false,
                tech_specs: {
                    'Dải đo': '0-10 bar / 0-16 bar',
                    'Độ sai số': '0.5%',
                    'Kết nối ren': 'G1/4',
                },
                features: [
                    'Màng cảm biến gốm sứ siêu bền',
                    'Thiết kế chống sốc điện',
                    'Kích thước nhỏ gọn',
                ],
                gallery: null,
                tech_summary: 'Dải đo áp suất linh hoạt, ngõ ra 4-20mA ổn định.',
                catalog_url: null,
                warranty: '12 tháng',
                origin: 'SGV Solution',
                availability: 'Sẵn hàng tại kho HCM',
                delivery_info: 'Toàn quốc (2-3 ngày)',
                category: 'Thiết Bị Đo',
            },
        ];

        for (const p of productsData) {
            const cat = allCats.find((c) => c.name === p.category);
            if (cat) {
                const { category, ...productValues } = p;
                await db
                    .insert(products)
                    .values({
                        ...(productValues as any),
                        description: p.tech_summary || p.name,
                        category_id: cat.id,
                    })
                    .onConflictDoUpdate({
                        target: products.sku,
                        set: {
                            ...(productValues as any),
                            description: p.tech_summary || p.name,
                            category_id: cat.id,
                            updated_at: new Date(),
                        },
                    });
                console.log(`Seeded/Updated product: ${p.name}`);
            }
        }
    }

    console.log('Products seeded. Seeding detailed news...');
    // 9. Seed Detailed News
    if (newsType) {
        const allCats = await db
            .select()
            .from(categories)
            .where(eq(categories.category_type_id, newsType.id));
        const author = (await db.select().from(authors).limit(1))[0];

        const newsData = [
            {
                id: '1ac11ae3-c446-4055-9d20-e9a7e1975f0f',
                title: 'Sài Gòn Valve tham dự Vietnam Water Week 2025',
                slug: 'sai-gon-valve-tham-du-vietnam-water-week-2025',
                summary: 'Sài Gòn Valve tham dự Vietnam Water Week 2025',
                content:
                    '<p><span style="color: rgb(7, 79, 106); font-size: 18pt;"><strong>Sài Gòn Valve tham dự Vietnam Water Week 2025 – Đồng hành cùng ngành nước bước vào kỷ nguyên công nghệ mới</strong></span></p><p><span style="color: rgb(7, 79, 106); font-size: 13pt;">Trong bối cảnh ngành cấp thoát nước Việt Nam đang chuyển mình mạnh mẽ để đáp ứng nhu cầu phát triển đô thị, bảo vệ tài nguyên và ứng phó với biến đổi khí hậu, các giải pháp công nghệ tiên tiến đóng vai trò then chốt. <strong>Vietnam Water Week 2025</strong>&nbsp;– sự kiện ngành nước lớn nhất và có tầm ảnh hưởng nhất tại Việt Nam – sẽ diễn ra từ <strong>20 đến 22/08/2025 tại Cung Văn hóa Lao động Hữu nghị Việt-Xô, Hà Nội</strong>.</span></p><p><span style="color: rgb(7, 79, 106); font-size: 13pt;"><strong>Vietnam Water Week 2025 – Sự kiện quy mô quốc tế cho ngành nước Việt Nam</strong></span></p><p><span style="color: rgb(7, 79, 106); font-size: 13pt;">Vietnam Water Week là nơi quy tụ hàng trăm doanh nghiệp, tổ chức trong và ngoài nước, cùng hàng nghìn chuyên gia, nhà quản lý, kỹ sư vận hành và nhà đầu tư. Chủ đề của năm 2025: <strong>“Ngành nước Việt Nam trong kỷ nguyên mới: Thách thức và cơ hội”</strong>, tập trung vào chuyển đổi số, quản lý bền vững và ứng dụng công nghệ tiên tiến để nâng cao hiệu quả quản lý, khai thác và bảo vệ nguồn nước.</span></p><p><span style="color: rgb(7, 79, 106); font-size: 13pt;">Các sự kiện tiêu biểu trong khuôn khổ triển lãm gồm:</span></p><p><span style="color: rgb(7, 79, 106); font-size: 10pt;"><strong>· </strong></span><span style="color: rgb(7, 79, 106); font-size: 13pt;"><strong>Hội thảo quốc tế ngành nước</strong>: Quy tụ chuyên gia hàng đầu từ các tổ chức quốc tế (Ngân hàng Thế giới, ADB, JICA…) và doanh nghiệp công nghệ, tập trung vào các chủ đề nóng như chuyển đổi số trong quản lý mạng lưới, ứng dụng IoT và AI trong ngành nước, giải pháp thích ứng biến đổi khí hậu và nâng cao chất lượng dịch vụ.</span></p><p><span style="color: rgb(7, 79, 106); font-size: 10pt;"><strong>· </strong></span><span style="color: rgb(7, 79, 106); font-size: 13pt;"><strong>Khu triển lãm công nghệ &amp; sản phẩm tiên tiến</strong>: Gần 300 gian hàng trưng bày sản phẩm và giải pháp từ hơn 200 doanh nghiệp trong và ngoài nước, giới thiệu xu hướng mới nhất về van, bơm, đồng hồ đo, thiết bị quan trắc, phần mềm quản lý và công nghệ xử lý nước tiên tiến.</span></p><p><span style="color: rgb(7, 79, 106); font-size: 10pt;"><strong>· </strong></span><span style="color: rgb(7, 79, 106); font-size: 13pt;"><strong>Lễ trao giải Vietnam Water Awards</strong>: Tôn vinh các doanh nghiệp, dự án và sản phẩm xuất sắc trong đổi mới công nghệ, nâng cao hiệu quả vận hành, và đóng góp cho sự phát triển bền vững ngành nước Việt Nam.</span></p><p><span style="color: rgb(7, 79, 106); font-size: 10pt;"><strong>· </strong></span><span style="color: rgb(7, 79, 106); font-size: 13pt;"><strong>Hoạt động kết nối doanh nghiệp (B2B Matching)</strong>: Tạo không gian gặp gỡ trực tiếp và trực tuyến giữa nhà cung cấp, nhà quản lý và khách hàng tiềm năng để mở rộng cơ hội hợp tác, đầu tư.</span></p><p><span style="color: rgb(7, 79, 106); font-size: 13pt;"><strong>Chia sẻ về Tuần lễ ngành Nước Việt Nam 2025, ông Nguyễn Ngọc Điệp - Chủ tịch Hội Cấp Thoát nước Việt Nam</strong>&nbsp;cho biết: \"Trong bối cảnh ngành nước đang chuyển mình mạnh mẽ theo hướng số hóa toàn diện, Vietnam Water Week 2025 không chỉ dừng lại ở triển lãm truyền thống, việc kết hợp với AROBID sẽ là điểm nhấn quan trọng giúp cho các doanh nghiệp ngành Nước kết nối hiệu quả hơn\"./.</span></p><p><span style="color: rgb(7, 79, 106); font-size: 13pt;"><strong>Sài Gòn Valve – Đưa công nghệ điều khiển thông minh đến Vietnam Water Week 2025</strong></span></p><p><span style="color: rgb(7, 79, 106); font-size: 13pt;">Tham dự sự kiện năm nay, <strong>Sài Gòn Valve</strong>&nbsp;mang đến một không gian trưng bày hiện đại, nơi giới thiệu những giải pháp cốt lõi đã tạo nên thương hiệu của công ty trong ngành nước:</span></p><p><span style="color: rgb(7, 79, 106); font-size: 10pt;"><strong>· </strong></span><span style="color: rgb(7, 79, 106); font-size: 13pt;"><strong>Van giảm áp đa hằng số SV3-PRV</strong>&nbsp;– sản phẩm nổi bật giúp điều chỉnh áp lực mạng lưới theo nhiều kịch bản khác nhau chỉ với một chiếc laptop hoặc một chiếc smart phone.</span></p><p><span style="color: rgb(7, 79, 106); font-size: 10pt;"><strong>· </strong></span><span style="color: rgb(7, 79, 106); font-size: 13pt;"><strong>Thiết bị quan trắc và datalogger</strong>&nbsp;– giải pháp giám sát chất lượng nước, áp lực và lưu lượng theo thời gian thực, hỗ trợ ra quyết định nhanh chóng và nâng cao chất lượng dịch vụ cấp nước.</span></p><p><span style="color: rgb(7, 79, 106); font-size: 10pt;"><strong>· </strong></span><span style="color: rgb(7, 79, 106); font-size: 13pt;"><strong>Giải pháp điều khiển van tự động bằng actuator</strong>&nbsp;– giúp các đơn vị quản lý mạng lưới nước tiết kiệm nhân lực, giảm chi phí vận hành và nâng cao độ tin cậy của hệ thống.</span></p><p><span style="color: rgb(7, 79, 106); font-size: 13pt;"><strong>Cam kết của Sài Gòn Valve</strong></span></p><p><span style="color: rgb(7, 79, 106); font-size: 13pt;">Là doanh nghiệp tiên phong cung cấp các giải pháp điều khiển và giám sát mạng lưới cấp nước, Sài Gòn Valve hướng đến sứ mệnh <strong>hỗ trợ ngành nước Việt Nam ứng dụng công nghệ mới, tối ưu hóa nguồn lực, giảm thất thoát và nâng cao chất lượng dịch vụ</strong>.</span></p><p><span style="color: rgb(7, 79, 106); font-size: 13pt;">Ông&nbsp;Phan Hiệp – đại diện Công ty Sài Gòn Valve chia sẻ:</span></p><p><span style="color: rgb(7, 79, 106); font-size: 13pt;">“Vietnam Water Week là cơ hội tuyệt vời để chúng tôi không chỉ giới thiệu sản phẩm mà còn lắng nghe nhu cầu thực tế từ các đơn vị vận hành, qua đó hoàn thiện và phát triển những giải pháp sát với thực tiễn nhất.”</span></p><p><span style="color: rgb(7, 79, 106); font-size: 13pt;"><strong>Hẹn gặp tại gian hàng của Sài Gòn Valve</strong></span></p><p><span style="color: rgb(7, 79, 106); font-size: 13pt;">Sài Gòn Valve trân trọng mời quý khách hàng, đối tác ghé thăm <strong>gian hàng [Số gian hàng nếu có]</strong>&nbsp;tại <strong>Vietnam Water Week 2025</strong>&nbsp;để trực tiếp trải nghiệm các sản phẩm và giải pháp công nghệ tiên tiến. Đây là dịp kết nối, trao đổi ý tưởng và cùng nhau xây dựng ngành nước Việt Nam hiện đại, bền vững.</span></p><img src=\"/uploads/images/2026/1768791703374-d5tn7o.png\" data-align=\"center\" class=\"align-center\" style=\"width: 100%; height: auto;\"><img src=\"/uploads/images/2026/1768791720075-1mdttn.png\" data-align=\"center\" class=\"align-center\" style=\"width: 100%; height: auto;\"><p></p><p><span style=\"color: rgb(7, 79, 106); font-size: 13pt;\">(nguồn ảnh: Vietnam water week) <br><br></span></p><p><span style=\"color: rgb(7, 79, 106); font-size: 13pt;\">&nbsp;</span></p>',
                status: 'published' as const,
                published_at: new Date('2026-01-22T17:00:00.000Z'),
                category: 'Sự kiện công ty',
                image_url: '/uploads/images/2026/1768791720075-1mdttn.png',
                gallery: [],
            },
            {
                id: '62292eb6-1818-4a6e-856c-8a53f415aceb',
                title: 'Giải pháp Smart Water: Xu hướng tất yếu của đô thị thông minh',
                slug: 'giai-phap-smart-water-xu-huong-do-thi-thong-minh',
                summary:
                    'Sài Gòn Valve cùng xây dựng hạ tầng nước thông minh cho cuộc sống hiện đại.',
                content:
                    '<p>Đô thị thông minh không thể thiếu quản lý nước thông minh. Từ việc đọc số đồng hồ tự động đến điều khiển áp lực tự động giúp tiết kiệm điện năng cho trạm bơm.</p><p>Sài Gòn Valve đang đi đầu trong việc cung cấp các hệ sinh thái Smart Water tích hợp AI và dữ liệu lớn (Big Data).</p>',
                status: 'published' as const,
                published_at: new Date('2026-01-17T07:42:53.110Z'),
                category: 'Tin tức chung',
                image_url: 'https://saigonvalve.vn/uploads/files/2024/11/14/DATALOGGER.png',
                gallery: null,
            },
            {
                id: '4c0c8c97-f6df-466d-bdff-14f8e772b6a1',
                title: 'Tiêu chuẩn bảo vệ IP68 là gì và tại sao nó quan trọng với ngành nước?',
                slug: 'tieu-chuan-ip68-va-quan-trong-nganh-nuoc',
                summary:
                    'Giải mã các thông số kỹ thuật để giúp kỹ sư lựa chọn thiết bị không bị hư hỏng khi ngập nước.',
                content:
                    '<p>IP68 là viết tắt của Ingress Protection 68 - cấp độ bảo vệ cao nhất cho thiết bị điện tử chống lại bụi và nước ngập lâu ngày.</p><p>Với đặc thù ngành nước, các thiết bị lắp đặt trong hố van thường xuyên bị ngập sâu sau các trận mưa lớn. Vì vậy, việc trang bị thiết bị đạt chuẩn IP68 là bắt buộc để đảm bảo hệ thống không bị gián đoạn.</p>',
                status: 'published' as const,
                published_at: new Date('2026-01-17T07:42:53.105Z'),
                category: 'Kiến thức kỹ thuật',
                image_url: 'https://saigonvalve.vn/uploads/files/2024/11/14/-c.png',
                gallery: null,
            },
            {
                id: '32562146-19e3-4ba7-b6f5-f72af508706d',
                title: 'Sài Gòn Valve đồng hành cùng các hoạt động thiện nguyện ngành nước',
                slug: 'sai-gon-valve-thien-nguyen-nganh-nuoc',
                summary: 'Tặng hệ thống lọc nước RO cho trường học tại các khu vực khó khăn.',
                content:
                    '<p>Nằm trong chuỗi hoạt động trách nhiệm xã hội, Sài Gòn Valve đã trao tặng 5 hệ thống lọc nước sạch công suất lớn cho các trường tiểu học tại vùng sâu vùng xa tỉnh Đắk Lắk.</p><p>Chúng tôi mong muốn góp phần mang lại nguồn nước sạch an toàn cho các em học sinh, hướng tới một tương lai khỏe mạnh.</p>',
                status: 'published' as const,
                published_at: new Date('2026-01-17T07:42:53.101Z'),
                category: 'Sự kiện công ty',
                image_url: '/uploads/images/2026/01/19/1768812077573-6suj4u.png',
                gallery: ['/uploads/images/2026/01/19/1768812144035-nzsish.jpg'],
            },
            {
                id: '70e6be05-c763-4c22-9089-e6550e0dceda',
                title: 'Công nghệ DMA và giải pháp chống thất thoát nước (NRW)',
                slug: 'cong-nghe-dma-giai-phap-chong-that-thoat',
                summary:
                    'Cách chia vùng tách mạng lưới (DMA) kết hợp thiết bị đo thông minh của SGV giúp giảm tỷ lệ thất thoát nước.',
                content:
                    '<p>Thất thoát nước là bài toán đau đầu của mọi công ty cấp nước. Việc áp dụng vùng quản lý áp lực (DMA) kết hợp với các đồng hồ đo lưu lượng điện từ cực nhạy giúp phát hiện sớm các vị trí rò rỉ ngầm.</p><p>Sài Gòn Valve cung cấp giải pháp trọn gói từ thiết kế DMA đến lắp đặt thiết bị đo và phần mềm giám sát SCADA.</p>',
                status: 'published' as const,
                published_at: new Date('2026-01-17T07:42:53.096Z'),
                category: 'Kiến thức kỹ thuật',
                image_url:
                    'https://saigonvalve.vn/uploads/files/2024/06/12/Blue-and-White-Clean-Modern-Technology-Conference-Zoom-Virtual-Background-2-.png',
                gallery: null,
            },
            {
                id: '14369538-48cd-4d38-beee-27962456b561',
                title: 'Sài Gòn Valve khai trương văn phòng đại diện tại Hà Nội',
                slug: 'khai-truong-van-phong-dai-dien-ha-noi',
                summary: 'Mở rộng quy mô hoạt động để phục vụ khách hàng khu vực phía Bắc tốt hơn.',
                content:
                    '<p>Nhằm đáp ứng nhu cầu ngày càng tăng về thiết bị ngành nước tại miền Bắc, Sài Gòn Valve chính thức khai trương văn phòng đại diện tại Hà Nội vào tháng 4/2025.</p><p>Văn phòng mới sẽ là trung tâm tư vấn kỹ thuật và hỗ trợ bảo hành cho các dự án tại khu vực đồng bằng sông Hồng và vùng núi phía Bắc.</p>',
                status: 'published' as const,
                published_at: new Date('2026-01-17T07:42:53.091Z'),
                category: 'Sự kiện công ty',
                image_url:
                    'https://saigonvalve.vn/uploads/files/2024/06/12/Blue-and-White-Clean-Modern-Technology-Conference-Zoom-Virtual-Background-2-.png',
                gallery: null,
            },
            {
                id: 'f014d811-3d08-47c0-b068-660afbd9291c',
                title: 'Ứng dụng Actuator NOAH Korea trong tự động hóa nhà máy',
                slug: 'ung-dung-actuator-noah-korea-tu-dong-hoa',
                summary:
                    'Tìm hiểu về bộ điều khiển điện thông minh giúp thay thế thao tác thủ công, nâng cao hiệu suất.',
                content:
                    '<p>Bộ điều khiển điện (Actuator) NOAH từ Hàn Quốc nổi tiếng với độ bền và khả năng tích hợp mạnh mẽ. Tại Việt Nam, Sài Gòn Valve là đơn vị phân phối chính thức.</p><p>Sản phẩm đạt tiêu chuẩn IP67/IP68, cho phép vận hành trong môi trường ẩm ướt, bụi bẩn mà vẫn đảm bảo độ chính xác tuyệt đối.</p>',
                status: 'published' as const,
                published_at: new Date('2026-01-17T07:42:53.085Z'),
                category: 'Kiến thức kỹ thuật',
                image_url:
                    'https://saigonvalve.vn/uploads/files/2025/04/17/thumbs/IOT-306x234-5.png',
                gallery: null,
            },
            {
                id: 'e2cff332-fa83-4a72-83d6-99f2d0d4aa3a',
                title: 'Dự án xử lý nước thải KCN VSIP được Sài Gòn Valve trang bị thiết bị đo',
                slug: 'du-an-xu-ly-nuoc-thai-vsip-sgv',
                summary:
                    'Cung cấp hệ thống cảm biến đo Online pH, COD, TSS cho khu công nghiệp kiểu mẫu.',
                content:
                    '<p> Tiếp tục khẳng định vị thế trong ngành xử lý nước thải, Sài Gòn Valve vừa hoàn tất lắp đặt hệ thống quan trắc chất lượng nước đầu ra tại KCN VSIP Bình Dương.</p><p>Hệ thống giúp nhà quản trị KCN giám sát liên tục các chỉ số môi trường, đảm bảo tuân thủ nghiêm ngặt quy định của Bộ Tài nguyên và Môi trường.</p>',
                status: 'published' as const,
                published_at: new Date('2026-01-17T07:42:53.081Z'),
                category: 'Tin tức chung',
                image_url:
                    'https://saigonvalve.vn/uploads/files/2025/06/24/thumbs/495616963_642796365424897_6462862703532989991_n-306x234-5.jpg',
                gallery: null,
            },
            {
                id: '1bfd76fb-283e-4a7a-9857-25d5ef0948e9',
                title: 'Vai trò của van giảm áp trong hệ thống cấp nước nhà cao tầng',
                slug: 'vai-tro-van-giam-ap-nha-cao-tang',
                summary:
                    'Phân tích tại sao van giảm áp là thành phần không thể thiếu để bảo vệ đường ống trong các tòa nhà.',
                content:
                    '<p>Trong các tòa nhà cao tầng, áp lực nước ở các tầng thấp thường rất lớn do chênh lệch độ cao. Nếu không có van giảm áp, đường ống và thiết bị vệ sinh sẽ dễ dàng bị bùng nổ hoặc hư hại.</p><p>Van giảm áp Arita do Sài Gòn Valve cung cấp giúp duy trì áp suất đầu ra ổn định bất kể áp đầu vào thay đổi, bảo vệ toàn diện hệ thống cơ điện (ME).</p>',
                status: 'published' as const,
                published_at: new Date('2026-01-17T07:42:53.078Z'),
                category: 'Kiến thức kỹ thuật',
                image_url: 'https://saigonvalve.vn/uploads/files/2025/03/19/VAN-C-NG-TL.png',
                gallery: null,
            },
            {
                id: '06ac4f58-c0db-417c-b810-50c895eaed68',
                title: 'Datalogger SV1-DAQ: Giải pháp giám sát thông minh từ xa',
                slug: 'datalogger-sv1-daq-giai-phap-iot',
                summary:
                    'Thiết bị truyền tải dữ liệu tự động tích hợp 4G LTE cho các trạm quan trắc mạng lưới.',
                content:
                    '<p>Làm thế nào để giám sát áp lực và lưu lượng trên toàn bộ mạng lưới cấp nước trải rộng hàng chục km? SV1-DAQ chính là câu trả lời.</p><p>Thiết bị có khả năng thu thập dữ liệu từ các cảm biến áp suất, lưu lượng, chất lượng nước và truyền về server đám mây qua mạng di động với mức tiêu thụ năng lượng cực thấp.</p>',
                status: 'published' as const,
                published_at: new Date('2026-01-17T07:42:53.074Z'),
                category: 'Tin tức chung',
                image_url: 'https://saigonvalve.vn/uploads/files/2024/11/14/DATALOGGER.png',
                gallery: null,
            },
        ];

        for (const newsItem of newsData) {
            const cat = allCats.find((c) => c.name === newsItem.category);
            if (cat && author) {
                const { category, ...newsValues } = newsItem;
                await db
                    .insert(newsArticles)
                    .values({
                        ...newsValues,
                        category_id: cat.id,
                        author_id: author.id,
                    })
                    .onConflictDoUpdate({
                        target: newsArticles.slug,
                        set: {
                            ...newsValues,
                            category_id: cat.id,
                            author_id: author.id,
                            updated_at: new Date(),
                        },
                    });
                console.log(`Seeded/Updated news: ${newsItem.title}`);
            }
        }
    }

    // 10. Seed Detailed Projects
    if (projectType) {
        const allCats = await db
            .select()
            .from(categories)
            .where(eq(categories.category_type_id, projectType.id));
        const waterCat = allCats.find((c) => c.name === 'Hệ Thống Cấp Nước');
        const autoCat = allCats.find((c) => c.name === 'Tự động hóa');

        if (waterCat) {
            await db
                .insert(projects)
                .values({
                    name: 'DỰ ÁN NÂNG CẤP HỆ THỐNG CẤP NƯỚC SẠCH TP. THỦ ĐỨC',
                    slug: 'nang-cap-cap-nuoc-thu-duc',
                    description:
                        'Cung cấp và lắp đặt hệ thống van bướm điều khiển điện DN800 cho trạm bơm tăng áp.',
                    client_name: 'SAWACO',
                    start_date: new Date('2024-01-15'),
                    end_date: new Date('2024-06-30'),
                    category_id: waterCat.id,
                    status: 'completed',
                    image_url: 'https://saigonvalve.vn/uploads/files/2024/11/14/du-an-cap-nuoc.png',
                })
                .onConflictDoNothing();
        }

        if (autoCat) {
            await db
                .insert(projects)
                .values({
                    name: 'TỰ ĐỘNG HÓA NHÀ MÁY XỬ LÝ NƯỚC THẢI KHU CÔNG NGHIỆP AMATA',
                    slug: 'tu-dong-hoa-xu-ly-nuoc-thai-amata',
                    description:
                        'Triển khai giải pháp giám sát Online các chỉ số pH, Độ đục, COD và điều khiển van tự động qua SCADA.',
                    client_name: 'AMATA Corp',
                    start_date: new Date('2024-05-20'),
                    category_id: autoCat.id,
                    status: 'ongoing',
                    image_url: 'https://saigonvalve.vn/uploads/files/2024/11/14/amata.png',
                })
                .onConflictDoNothing();
        }
    }

    console.log('Seeding completed!');
}

main().catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
});
