# Hướng Dẫn Build Docker & Triển Khai Lên VPS - SaigonValve & Đông Dương

Tài liệu hướng dẫn chi tiết quy trình đóng gói Docker và đưa toàn bộ hệ thống lên máy chủ ảo VPS.

---

## 1. Bản Chất Kiến Trúc Hệ Thống (Backend & Frontend)

Dự án này sử dụng kiến trúc **Next.js 15 Fullstack (App Router)**:
- **Frontend (Giao diện):** Nằm tại `app/[locale]/...` (Giao diện website SaigonValve, Đông Dương và Admin Portal CMS).
- **Backend (API & Logic):** Nằm tại `app/api/...` (Hệ thống REST API xử lý Auth JWT, Upload Media, Sản phẩm, Tin tức, Dự án, Tuyển dụng, Liên hệ...).
- **Cơ sở dữ liệu:** PostgreSQL kết nối qua Drizzle ORM (`db/...`).

> **LƯU Ý QUAN TRỌNG:**
> Bạn **KHÔNG CẦN** phải tách 2 container riêng biệt cho Frontend và Backend.
> Next.js với cấu hình `output: 'standalone'` sẽ tự động biên dịch và gom toàn bộ Frontend + Backend API thành **1 ứng dụng duy nhất** chạy trên port `3000`. Khi đóng gói bằng Docker multi-stage, image chỉ nặng khoảng **~180MB**.

---

## 2. Các Thành Phần Triển Khai Qua Docker

Hệ thống trên VPS sẽ chạy gồm:
1. **Container `sgv_web`**: Chạy Next.js Fullstack (Standalone Node.js Server), map ra cổng host **`3001`** (để KHÔNG trùng cổng 3000 của SCADA đang chạy trên cùng VPS).
2. **Container `sgv_postgres`**: Cơ sở dữ liệu PostgreSQL 16 Alpine.
3. **Docker Volume `uploads_data`**: Mount vào `/app/public/uploads` để lưu trữ ảnh, tài liệu upload lâu dài (không bị mất khi update container).
4. **Docker Volume `postgres_data`**: Lưu trữ dữ liệu database vĩnh viễn trên VPS.
5. **Reverse Proxy & SSL**: Sử dụng [`sgv-proxy`](file:///home/thanh/project_cty_sg_val/sgv_web_dong_duong/sgv-proxy) (`UPSTREAM_WEB=localhost:3001` và `DOMAIN_WEB=event-web.saigonvalve.vn`) hoặc Nginx độc lập để cấp HTTPS Let's Encrypt.

---

## 3. Các Bước Triển Khai Chi Tiết Trên VPS

### Bước 1: Chuẩn Bị VPS
Đăng nhập vào VPS qua SSH (khuyên dùng Ubuntu 22.04 LTS hoặc 24.04 LTS):

```bash
ssh root@<IP_VPS_CỦA_BẠN>
```

Cập nhật hệ điều hành và cài đặt Docker + Docker Compose:
```bash
# Cập nhật packages
sudo apt update && sudo apt upgrade -y

# Cài đặt Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Kiểm tra docker đã hoạt động
docker --version
docker compose version
```

---

### Bước 2: Triển Khai Lên VPS

#### 👉 Cách 1: Tự Động 100% Qua Makefile (CHUẨN NHẤT — Giống `frontend_remake` & `backend_remake`)
Chỉ cần chạy 1 lệnh duy nhất tại máy Local:
```bash
make deploy
```
*(hoặc `make deploy ENV_FILE=.env.production`)*

Hệ thống sẽ tự động:
1. Build image Docker Standalone tại local.
2. Nén image thành `sgv_web-latest.tar.gz`.
3. Mở kết nối SSH ControlMaster tới VPS (hỏi IP, user, đường dẫn lưu).
4. Upload Makefile, docker-compose.yml, file image và .env lên VPS.
5. Kích hoạt `make deploy-vps` trên VPS để nạp image và khởi chạy container.
6. Dọn dẹp file nén tạm, hoàn tất deploy an toàn và nhanh chóng (không cần tốn RAM VPS để build).

---

#### Cách 2: Sử dụng Git truyền thống:
```bash
mkdir -p /var/www/saigonvalve
cd /var/www/saigonvalve
git clone <URL_REPO_CỦA_BẠN> .
```

#### Cách 3: Đồng bộ bằng rsync / SCP:
```bash
# Chạy trên máy tính cá nhân của bạn:
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' ./ root@<IP_VPS>:/var/www/saigonvalve
```

---

### Bước 3: Thiết Lập Biến Môi Trường (.env)

Tại thư mục dự án trên VPS (`/var/www/saigonvalve`):
```bash
cp .env.production.example .env
nano .env
```

Chỉnh sửa các thông số quan trọng:
- `POSTGRES_USER` & `POSTGRES_PASSWORD`: Mật khẩu bảo mật cho database.
- `POSTGRES_DB`: Tên database (mặc định `sgv_db`).
- `DATABASE_URL`: Khớp mật khẩu trên, ví dụ:
  ```env
  DATABASE_URL=postgresql://sgv_admin:Mat_Khau_Bao_Mat@postgres:5432/sgv_db
  ```
- `NEXT_PUBLIC_SITE_URL`: Domain website (ví dụ `https://saigonvalve.vn`).
- `NEXT_PUBLIC_API_URL`: Domain API (ví dụ `https://saigonvalve.vn/api`).
- `JWT_SECRET`: Chuỗi ký tự ngẫu nhiên bảo mật token.
- `MAIL_*`: Cấu hình tài khoản email gửi báo giá/liên hệ.

---

### Bước 4: Khởi Chạy Database & Seed Dữ Liệu Ban Đầu

1. Khởi động PostgreSQL trước:
```bash
docker compose up -d postgres
```

2. Kiểm tra container database đã sẵn sàng (`healthy`):
```bash
docker compose ps
```

3. Khởi tạo cấu trúc bảng (Migration Drizzle):
Bạn có thể chạy trực tiếp một container tạm để push schema vào database:
```bash
docker compose run --rm web npx drizzle-kit push
```

Hoặc nạp dữ liệu chuẩn kỹ thuật (Seed script):
```bash
docker compose run --rm web node scripts/seed_dongduong_master.js
```

---

### Bước 5: Build Và Chạy Toàn Bộ Hệ Thống

Chạy lệnh build và khởi động toàn bộ cụm container ở chế độ chạy nền (detached):
```bash
docker compose up -d --build
```

Kiểm tra log hệ thống:
```bash
docker compose logs -f web
```
Khi thấy dòng log `Listening on port 3000` hoặc `Ready in ...ms`, hệ thống web & API đã chạy thành công!

---

### Bước 6: Cấu Hình Reverse Proxy & SSL (HTTPS)

#### 👉 Lựa chọn 1: Dùng cụm `sgv-proxy` có sẵn (KHUYÊN DÙNG khi chạy chung VPS)
Trong thư mục `sgv-proxy`, hệ thống đã được mở rộng hỗ trợ thêm Web:
- Biến trong `sgv-proxy/.env.event`:
  ```env
  DOMAIN_WEB=event-web.saigonvalve.vn
  UPSTREAM_WEB=localhost:3001
  ```
- Chỉ cần deploy `sgv-proxy`:
  ```bash
  cd sgv-proxy
  make deploy-remote ENV_FILE=.env.event
  ```
`sgv-proxy` sẽ tự động cấp chứng chỉ SSL Let's Encrypt và định tuyến HTTPS từ `event-web.saigonvalve.vn` (hoặc domain web bạn đặt) vào cổng `3001` của container `sgv_web`. **Tuyệt đối không xung đột với SCADA (port 3000), Frontend (port 8080) hay Backend API (port 8998)!**

---

#### Lựa chọn 2: Cài Nginx truyền thống trên VPS
Nếu VPS chạy riêng lẻ, cấu hình Nginx trỏ vào cổng `3001`:
```nginx
server {
    listen 80;
    server_name saigonvalve.vn www.saigonvalve.vn;
    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Kích hoạt và cấp SSL Let's Encrypt:
```bash
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d saigonvalve.vn -d www.saigonvalve.vn
```

---

## 4. Các Lệnh Quản Trị Hệ Thống Hữu Ích

| Thao Tác | Lệnh Thực Hiện |
| :--- | :--- |
| **Xem trạng thái containers** | `docker compose ps` |
| **Xem log trực tiếp của Web** | `docker compose logs -f web` |
| **Khởi động lại dịch vụ** | `docker compose restart web` |
| **Dừng hệ thống** | `docker compose down` |
| **Cập nhật code mới từ Git & Redeploy** | `git pull && docker compose up -d --build` |
| **Backup cơ sở dữ liệu PostgreSQL** | `docker compose exec -t postgres pg_dump -U sgv_admin sgv_db > backup_$(date +%F).sql` |
| **Phục hồi cơ sở dữ liệu từ file SQL** | `cat backup_file.sql \| docker compose exec -T postgres psql -U sgv_admin -d sgv_db` |

---

## 5. Danh Sách File Đã Cấu Hình Sẵn Trong Dự Án

- [`Dockerfile`](file:///home/thanh/project_cty_sg_val/sgv_web_dong_duong/Dockerfile): Tối ưu Next.js 15 Standalone đa tầng (Multi-stage build).
- [`docker-compose.yml`](file:///home/thanh/project_cty_sg_val/sgv_web_dong_duong/docker-compose.yml): Cấu hình dịch vụ Web + PostgreSQL + Persistent Volumes.
- [`.env.production.example`](file:///home/thanh/project_cty_sg_val/sgv_web_dong_duong/.env.production.example): Mẫu biến môi trường cho môi trường Production trên VPS.
- [`.dockerignore`](file:///home/thanh/project_cty_sg_val/sgv_web_dong_duong/.dockerignore): Tối ưu build context không gửi file rác.

---

## 6. Hướng Dẫn Migration & Quản Lý Database (Chuẩn Kiến Trúc Như Event)

Hệ thống cung cấp trọn bộ công cụ Migration và Clone/Backup Database qua SSH tunnel bảo mật, tự động đóng tunnel sau khi kết thúc.

### 6.1. Migration trên Database Remote (VPS)

Khi bạn thêm trường mới vào `db/schemas/*.ts` hoặc sửa đổi cấu trúc bảng:

* **Chạy Migration trên DB Remote (Menu tương tác):**
  ```bash
  make migration-remote
  # hoặc lệnh tắt:
  make migration
  ```
  Lệnh sẽ hỏi IP VPS, Port, User, Pass (có sẵn giá trị mặc định, chỉ cần nhấn Enter), mở SSH tunnel bảo mật và cung cấp 4 lựa chọn:
  1. `Run pending migrations`: Chạy các file SQL trong `drizzle/` chưa áp dụng.
  2. `Generate migration mới`: Tự so sánh code schema TypeScript với DB Remote, sinh file `000x_<name>.sql`, hiển thị nội dung và hỏi xác nhận trước khi áp.
  3. `Drizzle Push`: Đồng bộ trực tiếp thay đổi bảng/cột vào DB Remote.
  4. `Status`: Kiểm tra danh sách bảng hiện có và lịch sử migrations.

* **Chỉ Generate file Migration từ DB Remote (Read-Only, không đụng dữ liệu):**
  ```bash
  make migration-generate-remote
  ```

* **Kiểm tra trạng thái DB & Migrations trên Remote:**
  ```bash
  make migration-status
  ```

### 6.2. Migration trên Database Local

* **Chạy Migration trên DB Local:**
  ```bash
  make migration-local
  ```

### 6.3. Backup & Clone Database (Remote ↔ Local)

* **Backup DB Remote về máy Local (Không ảnh hưởng server đang chạy):**
  ```bash
  make db-dump-remote
  ```
  File dump sẽ được lưu tại `backups/remote-<ip>-<timestamp>.dump`.

* **Clone toàn bộ Data từ VPS về máy Local để test giả lập:**
  ```bash
  make db-clone-remote
  ```
  Lệnh tự động SSH vào VPS → dump dữ liệu `sgv_postgres` → tải về máy → hỏi xác nhận restore vào container Postgres local.

* **Backup DB Local:**
  ```bash
  make db-dump
  ```

* **Restore file dump bất kỳ vào Local:**
  ```bash
  make db-restore FILE=backups/ten_file.dump
  ```

