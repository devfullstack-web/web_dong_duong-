const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const JOBS = [
    {
        title: 'Kỹ Sư Tư Vấn & Thiết Kế Hệ Thống Điều Hòa Trung Tâm VRV/VRF & Chiller',
        slug: 'ky-su-thiet-ke-dieu-hoa-trung-tam-vrv-chiller',
        department: 'Phòng Kỹ Thuật & Giải Pháp M&E',
        location: 'TP. Hồ Chí Minh & Công trình Miền Nam',
        employment_type: 'full_time',
        salary_range: '18 - 30 triệu VND',
        experience_level: '2 - 5 năm',
        status: 'open',
        description: `
<p>Đông Dương Corporation tuyển dụng Kỹ sư Thiết kế & Tư vấn Giải pháp Điều hòa Không khí VRV/VRF & Chiller phục vụ các dự án trung tâm thương mại, tòa nhà văn phòng, khách sạn 5 sao và nhà máy công nghiệp.</p>
<h4>Trách nhiệm công việc:</h4>
<ul>
  <li>Khảo sát hiện trạng công trình, tính toán phụ tải lạnh (Heat Load Calculation) bằng phần mềm chuyên dụng (Trace 700, HAP).</li>
  <li>Lên phương án thiết kế hệ thống HVAC (VRV/VRF, Chiller giải nhiệt nước/gió, hệ thống ống gió, AHU/FCU).</li>
  <li>Bóc tách khối lượng (BOQ), lập dự toán thiết bị và đề xuất danh mục vật tư cơ điện lạnh.</li>
  <li>Hỗ trợ đội ngũ kinh doanh dự án thuyết trình giải pháp kỹ thuật với Chủ đầu tư và Tư vấn giám sát.</li>
  <li>Phối hợp cùng nhà sản xuất Daikin, Gree, Midea, LG để giải quyết các vấn đề kỹ thuật phát sinh.</li>
</ul>
        `,
        requirements: `
<ul>
  <li>Tốt nghiệp Đại học chuyên ngành Nhiệt Lạnh, Kỹ thuật Cơ điện (M&E), Năng lượng hoặc các ngành liên quan.</li>
  <li>Có tối thiểu 2 năm kinh nghiệm thiết kế hoặc giám sát thi công hệ thống điều hòa không khí VRV/VRF hoặc Chiller.</li>
  <li>Thành thạo phần mềm AutoCAD, Revit MEP, phần mềm tính tải lạnh HAP/Trace 700.</li>
  <li>Khả năng đọc hiểu tài liệu kỹ thuật tiếng Anh tốt; biết tiếng Trung là một lợi thế lớn.</li>
  <li>Kỹ năng giao tiếp, làm việc nhóm và tinh thần trách nhiệm cao trong công việc.</li>
</ul>
        `,
        benefits: `
<ul>
  <li>Mức lương thỏa thuận cạnh tranh: 18 - 30 triệu VND/tháng + Thưởng hiệu quả dự án hàng quý/năm.</li>
  <li>Thưởng tháng lương thứ 13, thưởng lễ tết, sinh nhật, du lịch nghỉ dưỡng hàng năm.</li>
  <li>Đầy đủ chế độ BHXH, BHYT, BHTN theo quy định của Nhà nước và bảo hiểm sức khỏe cao cấp.</li>
  <li>Được đào tạo chuyên sâu từ các chuyên gia kỹ thuật của các hãng Daikin, Gree, Midea, LG.</li>
  <li>Lộ trình thăng tiến rõ ràng lên vị trí Trưởng nhóm Kỹ thuật hoặc Chỉ huy trưởng Cơ điện M&E.</li>
</ul>
        `,
    },
    {
        title: 'Chuyên Viên Kinh Doanh Dự Án Gạch Ốp Lát & Vật Liệu Hoàn Thiện',
        slug: 'chuyen-vien-kinh-doanh-du-an-gach-op-lat',
        department: 'Khối Kinh Doanh Dự Án B2B',
        location: 'TP. Hồ Chí Minh & Các tỉnh lân cận',
        employment_type: 'full_time',
        salary_range: '15 - 28 triệu VND + Hoa hồng cao',
        experience_level: '1 - 3 năm',
        status: 'open',
        description: `
<p>Đông Dương Corporation là Tổng đại lý phân phối chính hãng các thương hiệu gạch hàng đầu: Đồng Tâm, Viglacera, Taicera, Catalan... Cần tuyển dụng Chuyên viên Kinh doanh Dự án phát triển thị trường B2B.</p>
<h4>Trách nhiệm công việc:</h4>
<ul>
  <li>Tìm kiếm, thiết lập và duy trì mối quan hệ hợp tác với Chủ đầu tư, Tổng thầu xây dựng, Công ty thiết kế kiến trúc và Nhà thầu nội thất.</li>
  <li>Giới thiệu các dòng sản phẩm gạch men cao cấp, gạch granite porcelain, gạch mosaic và đá nhân tạo cho các dự án căn hộ, biệt thự, resort.</li>
  <li>Lập báo giá dự án, đàm phán hợp đồng cung ứng vật tư và theo dõi tiến độ giao hàng tới chân công trình.</li>
  <li>Chăm sóc khách hàng và giải quyết các yêu cầu phát sinh sau bán hàng.</li>
</ul>
        `,
        requirements: `
<ul>
  <li>Tốt nghiệp Cao đẳng/Đại học khối Kinh tế, Quản trị Kinh doanh, Xây dựng hoặc Kiến trúc.</li>
  <li>Ưu tiên ứng viên có kinh nghiệm kinh doanh dự án vật liệu xây dựng (gạch men, thiết bị vệ sinh, sơn, nhôm kính...).</li>
  <li>Kỹ năng giao tiếp, đàm phán và thuyết phục khách hàng tốt.</li>
  <li>Nhanh nhẹn, trung thực, có khả năng làm việc độc lập và chịu áp lực doanh số tốt.</li>
</ul>
        `,
        benefits: `
<ul>
  <li>Lương cứng: 15 - 20 triệu VND + Hoa hồng doanh số dự án hấp dẫn (thu nhập không giới hạn từ 25 - 50 triệu/tháng).</li>
  <li>Phụ cấp xăng xe, điện thoại, tiếp khách dự án theo chính sách công ty.</li>
  <li>Chế độ BHXH, BHYT, nghỉ phép năm, teambuilding thường niên.</li>
  <li>Môi trường làm việc năng động, chuyên nghiệp, nguồn hàng phong phú có sẵn tại kho tổng.</li>
</ul>
        `,
    },
    {
        title: 'Kỹ Sư Giám Sát Lắp Đặt & Vận Hành Hệ Thống M&E',
        slug: 'ky-su-giam-sat-lap-dat-van-hanh-me',
        department: 'Phòng Thi Công & Dịch Vụ Kỹ Thuật',
        location: 'TP. Hồ Chí Minh & Các dự án trọng điểm',
        employment_type: 'full_time',
        salary_range: '16 - 25 triệu VND',
        experience_level: '2 - 4 năm',
        status: 'open',
        description: `
<p>Giám sát trực tiếp quá trình thi công, lắp đặt đường ống gas, ống nước Chiller, ống gió và thiết bị điều hòa trung tâm tại các đại công trình.</p>
<h4>Trách nhiệm công việc:</h4>
<ul>
  <li>Kiểm tra chất lượng thi công hệ thống cơ điện lạnh theo đúng bản vẽ thiết kế và tiêu chuẩn kỹ thuật TCVN / ASHRAE.</li>
  <li>Giám sát tiến độ, nghiệm thu vật tư đầu vào, thử áp suất đường ống gas và kiểm tra độ kín hệ thống.</li>
  <li>Chạy thử, đo đạc thông số nhiệt độ, áp suất, độ ồn và chuyển giao công nghệ vận hành cho khách hàng.</li>
  <li>Xử lý sự cố kỹ thuật và bảo trì định kỳ cho các tổ máy Chiller và hệ thống VRV.</li>
</ul>
        `,
        requirements: `
<ul>
  <li>Tốt nghiệp chuyên ngành Điện - Điện tử, Kỹ thuật Cơ điện, Kỹ thuật Nhiệt Lạnh.</li>
  <li>Kinh nghiệm thực tế từ 2 năm trở lên tại công trường cơ điện M&E.</li>
  <li>Nắm vững quy chuẩn an toàn lao động và kỹ thuật thi công ống đồng, ống Chiller, tủ điện điều khiển.</li>
  <li>Có chứng chỉ an toàn lao động là một lợi thế.</li>
</ul>
        `,
        benefits: `
<ul>
  <li>Lương: 16 - 25 triệu VND + Phụ cấp công trường, công tác phí.</li>
  <li>Bảo hiểm tai nạn 24/7 và BHXH đầy đủ.</li>
  <li>Cung cấp đầy đủ công cụ dụng cụ, thiết bị bảo hộ lao động hiện đại.</li>
  <li>Cơ hội thăng tiến lên Chỉ huy phó, Chỉ huy trưởng công trình.</li>
</ul>
        `,
    },
    {
        title: 'Chuyên Viên Kế Toán Kho & Quản Lý Chuỗi Cung Ứng Vật Liệu',
        slug: 'chuyen-vien-ke-toan-kho-chuoi-cung-ung',
        department: 'Phòng Kế Toán & Quản Lý Kho Bãi',
        location: 'Tổng Kho TP. Thủ Đức, TP. Hồ Chí Minh',
        employment_type: 'full_time',
        salary_range: '12 - 18 triệu VND',
        experience_level: '1 - 3 năm',
        status: 'open',
        description: `
<p>Quản lý số liệu xuất nhập tồn kho hàng gạch ốp lát và thiết bị điện lạnh tại Tổng kho Đông Dương.</p>
<h4>Trách nhiệm công việc:</h4>
<ul>
  <li>Theo dõi, kiểm tra chứng từ nhập - xuất kho hàng hóa theo đúng quy trình.</li>
  <li>Đối chiếu số lượng thực tế trong kho với phần mềm quản trị ERP / Kế toán định kỳ.</li>
  <li>Phối hợp cùng bộ phận logistics điều phối xe tải giao hàng đúng hẹn cho các nhà thầu.</li>
  <li>Lập báo cáo tồn kho, cảnh báo hàng sắp hết hoặc hàng chậm luân chuyển.</li>
</ul>
        `,
        requirements: `
<ul>
  <li>Tốt nghiệp Cao đẳng/Đại học chuyên ngành Kế toán, Tài chính, Logistics hoặc Quản trị chuỗi cung ứng.</li>
  <li>Có ít nhất 1 năm kinh nghiệm làm việc tại kho hàng vật liệu xây dựng hoặc hàng cơ điện.</li>
  <li>Cẩn thận, tỉ mỉ, trung thực và có tinh thần trách nhiệm cao.</li>
  <li>Sử dụng thành thạo phần mềm kế toán và Excel văn phòng.</li>
</ul>
        `,
        benefits: `
<ul>
  <li>Lương cứng: 12 - 18 triệu VND/tháng + Thưởng hiệu quả công việc.</li>
  <li>Môi trường kho bãi quy mô lớn, trang bị hệ thống quản lý hiện đại.</li>
  <li>Chế độ đãi ngộ đầy đủ, thưởng lễ tết, đồng phục công ty.</li>
</ul>
        `,
    },
];

async function main() {
    console.log('Seeding job_postings into database...');
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        for (const job of JOBS) {
            const query = `
                INSERT INTO job_postings (
                    id, title, slug, department, location, employment_type,
                    salary_range, experience_level, status, description, requirements, benefits,
                    created_at, updated_at
                )
                VALUES (
                    gen_random_uuid(), $1, $2, $3, $4, $5,
                    $6, $7, $8, $9, $10, $11,
                    NOW(), NOW()
                )
                ON CONFLICT (slug) DO UPDATE
                SET title = $1, department = $3, location = $4, employment_type = $5,
                    salary_range = $6, experience_level = $7, status = $8,
                    description = $9, requirements = $10, benefits = $11, updated_at = NOW();
            `;
            await client.query(query, [
                job.title,
                job.slug,
                job.department,
                job.location,
                job.employment_type,
                job.salary_range,
                job.experience_level,
                job.status,
                job.description.trim(),
                job.requirements.trim(),
                job.benefits.trim(),
            ]);
            console.log(` - Seeded job: ${job.title}`);
        }
        await client.query('COMMIT');
        console.log('Successfully seeded all job postings!');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Error seeding job postings:', e);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
