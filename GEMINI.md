# SaigonValve & Đông Dương Corporation - Development Rules

## BẮT BUỘC: ZERO MOCK DATA & BACKEND-DRIVEN POLICY

1. **Tuyệt đối không dùng Mock Data / Dữ liệu ảo**:
   - Nghiêm cấm hardcode mảng dữ liệu, chuỗi placeholder giả định trong component React/Next.js.
   - Mọi thông tin (thông tin liên hệ, sản phẩm, danh mục, banner slider, tin tức, quy trình, chính sách...) BẮT BUỘC lấy từ Backend Database (PostgreSQL/Drizzle ORM) qua API / Server Service.

2. **Tư duy Fullstack khi phát triển tính năng**:
   - Khi cần thêm thông tin hoặc giao diện mới mà Database chưa có dữ liệu: BẮT BUỘC viết seed script nạp dữ liệu chuẩn kỹ thuật vào cơ sở dữ liệu PostgreSQL trước, sau đó tạo API/Service để frontend truy vấn.

3. **Thông tin liên hệ & Thương hiệu (Single Source of Truth)**:
   - Thông tin liên hệ chuẩn Saigon Valve:
     - **Địa chỉ:** Số 124/16-18 Võ Văn Hát, Long Trường, TP. Thủ Đức, TP. Hồ Chí Minh
     - **Hotline:** 090 695 54 59
     - **Email:** info@saigonvalve.vn
     - **Website:** https://saigonvalve.vn
   - Toàn bộ thông tin này phải lấy từ bảng `system_settings` qua `useSiteInfo()` (`SiteInfoProvider`), không được ghi đè tĩnh ở từng trang.

4. **Đa ngôn ngữ & Đồng bộ Repository**:
   - Hỗ trợ đầy đủ song ngữ `vi` và `en` trong `i18n/messages/vi.json` và `en.json`.
   - Đồng bộ 100% giữa `/home/thanh/project_cty_sg_val/sgv_web_dong_duong` và `/home/thanh/project_cty_sg_val/sgv_cms`.

5. **Chuẩn hóa đầy đủ các phương thức HTTP REST API (Full HTTP Verbs Parity)**:
   - Mọi tài nguyên thực thể (Products, News, Projects, Jobs, Categories, Users, Roles, Contacts, Comments, Solutions, Settings) BẮT BUỘC hỗ trợ đầy đủ các method: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`.
   - Luôn cung cấp alias `export const PUT = PATCH;` trên các tuyến cập nhật chi tiết để đảm bảo Frontend gọi bất kỳ phương thức nào cũng phản hồi thành công, không bao giờ để xảy ra lỗi `405 Method Not Allowed`.

