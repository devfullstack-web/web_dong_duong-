# Hướng Dẫn Build Docker & Triển Khai Lên VPS - SaigonValve & Đông Dương

Tài liệu hướng dẫn chi tiết quy trình đóng gói Docker, bảo toàn dữ liệu khi deploy và các chuẩn quản trị tương đồng với `backend_dauthau`.

---

## 1. Bản Chất Kiến Trúc Hệ Thống & Cơ Chế Bảo Toàn Dữ Liệu

### 1.1. Kiến Trúc Fullstack Next.js 15 (App Router)
- **Frontend (Giao diện):** Nằm tại `app/[locale]/...` (Website SaigonValve, Đông Dương và Admin Portal CMS).
- **Backend (API & Services):** Nằm tại `app/api/...` (Hệ thống REST API xử lý Auth JWT, Media Upload, Sản phẩm, Tin tức, Dự án, Tuyển dụng, Liên hệ, Cài đặt hệ thống...).
- **Cơ sở dữ liệu:** PostgreSQL 16 kết nối qua Drizzle ORM (`db/...`).
- Next.js cấu hình `output: 'standalone'` tự động gom toàn bộ Frontend + Backend API thành **1 ứng dụng duy nhất** chạy trên port `3000`.

---

### 1.2. 🛡️ BẢO VỆ DỮ LIỆU TUYỆT ĐỐI KHI DEPLOY (Không Đè Database Cũ)

**Câu hỏi quan trọng:** *Khi người quản trị vào Admin Portal chỉnh sửa thông tin (sản phẩm, bài viết, số điện thoại, banner, ảnh upload...), việc chạy `make deploy` có làm mất hay đè dữ liệu cũ không?*

**TRẢ LỜI: HOÀN TOÀN KHÔNG! DỮ LIỆU ĐƯỢC BẢO TOÀN 100%!**

Lý do kỹ thuật:
1. **Dữ liệu Database nằm trong Named Volume riêng biệt (`sgv_postgres_data`):**
   - PostgreSQL lưu toàn bộ bảng và dữ liệu tại volume `sgv_postgres_data` trên ổ cứng máy chủ VPS (`/var/lib/docker/volumes/sgv_postgres_data/_data`).
   - Khi chạy `make deploy`, Docker chỉ cập nhật image `sgv-web-dong-duong:latest` của container `web`. Container database `sgv_postgres` và volume `sgv_postgres_data` **hoàn toàn giữ nguyên**, không bị recreate hay reset.
2. **File hình ảnh và tài liệu upload nằm trong Volume (`sgv_uploads_data`):**
   - Mọi ảnh sản phẩm, bài viết do Admin tải lên được lưu tại volume `sgv_uploads_data` (`/app/public/uploads`). Khi deploy code mới, thư mục này được mount lại nguyên vẹn.
3. **Cơ chế Marker `.setup-complete` & Pre-flight Table Audit (Chuẩn `backend_dauthau`):**
   - Giống như kiến trúc trong `backend_dauthau`, target `first-run` trên VPS kiểm tra file `.setup-complete`.
   - Nếu đã có file `.setup-complete` HOẶC database đã có sẵn các bảng đang hoạt động, hệ thống **TỰ ĐỘNG BỎ QUA SEED** để bảo vệ dữ liệu đang chạy.
   - Các lệnh nạp đè dữ liệu mẫu (`make seed-remote`, `make seed-vps`) đều được trang bị bước xác nhận bảo vệ (`gõ 'yes' để xác nhận`).

---

## 2. Bảng Lệnh Quản Trị Hệ Thống (Chuẩn Hóa Theo `backend_dauthau`)

Toàn bộ Makefile đã được chuẩn hóa với Shell `/bin/bash`, cờ `-p $(PROJECT)` và các lệnh thao tác nhanh:

| Nhóm | Lệnh | Mô Tả Chức Năng |
| :--- | :--- | :--- |
| **Deploy** | `make deploy` | ⭐ Build local, nén .tar.gz, upload VPS qua SSH và reload code (KHÔNG đè DB) |
| | `make deploy-remote` | Chi tiết quá trình upload SSH + docker load + start an toàn |
| | `make deploy-vps` | Lệnh chạy nội bộ trên VPS: setup môi trường + load image + up |
| **Container** | `make up` | Chạy toàn bộ containers ở chế độ daemon |
| | `make down` | Dừng toàn bộ containers |
| | `make restart` | Khởi động lại container web |
| | `make ps` | Xem trạng thái các container |
| | `make logs` | Xem logs thời gian thực của web container |
| | `make clean` | Dọn dẹp images/containers cũ (BẢO TOÀN Volume DB và Uploads, không dùng `-v`) |
| **Database Infra** | `make db-up` (hoặc `make start-db`) | Khởi động riêng container PostgreSQL |
| | `make db-down` | Dừng container PostgreSQL |
| | `make db-logs` | Xem logs PostgreSQL |
| | `make wait-db` | Chờ PostgreSQL sẵn sàng kết nối (`pg_isready`) |
| **Migration** | `make migration` (hoặc `make migration-remote`) | ⭐ Chạy công cụ Migration tương tác trên DB Remote qua SSH Tunnel |
| | `make migration-generate-remote` | ⭐ Chỉ sinh file SQL từ diff TypeScript schema ↔ DB Remote (Read-only) |
| | `make migration-local` | Chạy Drizzle migration trên DB Local |
| | `make migration-status` | Kiểm tra danh sách bảng & trạng thái migration trên VPS |
| | `make db-push-remote` | Push schema trực tiếp trên VPS container |
| **Backup & Clone** | `make db-dump-remote` | ⭐ Backup DB VPS về máy local (`backups/remote-*.dump`) |
| | `make db-clone-remote` | Clone toàn bộ dữ liệu từ VPS về Local để test |
| | `make db-dump` | Backup DB Local |
| | `make db-restore FILE=...` | Khôi phục dump vào DB Local |
| **Seed & Cấp quyền** | `make seed-admin-remote` | Cập nhật tài khoản Admin & phân quyền RBAC từ `.env` lên VPS |
| | `make seed-remote` | ⚠️ Nạp đè toàn bộ dữ liệu mẫu lên VPS (Có prompt gõ `yes`) |
| | `make seed-vps` | ⚠️ Nạp đè dữ liệu trực tiếp khi đang SSH trên VPS |
| **Tiện ích** | `make fix-ssl-event` | 🚑 Khôi phục chứng chỉ SSL SAN cho toàn bộ domain |

---

## 3. Quy Trình Thay Đổi Bảng & Cột Trong Tương Lai (Drizzle Migration)

Khi bạn cần thêm bảng hoặc cột mới trong `db/schemas/*.ts`:

1. **Bước 1: Backup DB VPS đề phòng:**
   ```bash
   make db-dump-remote
   ```
2. **Bước 2: Tạo migration hoặc đồng bộ qua SSH Tunnel:**
   ```bash
   make migration
   ```
   Chọn một trong các tùy chọn:
   - **Tùy chọn 2 (`Generate migration mới`):** Hệ thống sẽ so sánh code schema TypeScript mới của bạn với DB trên VPS, tự động sinh file `000x_ten_migration.sql` trong thư mục `drizzle/`. Bạn kiểm tra nội dung SQL và chọn áp dụng ngay.
   - **Tùy chọn 3 (`Drizzle Push`):** So sánh trực tiếp và áp dụng các câu lệnh `ALTER TABLE / ADD COLUMN` vào DB Remote mà không làm mất dữ liệu các bảng cũ.
3. **Bước 3: Deploy code mới lên VPS:**
   ```bash
   make deploy
   ```
