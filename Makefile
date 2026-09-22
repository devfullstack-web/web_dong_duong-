# ============================================================
#  SGV Web Dong Duong (Next.js Fullstack) — Docker Build & Deploy
#  Kiến trúc chuẩn hóa theo pattern /backend_dauthau
#  Local build → Save .tar.gz → SSH Upload → Load & Safe Run
# ============================================================

args=$(filter-out $@,$(MAKECMDGOALS))

SHELL := /bin/bash
.EXPORT_ALL_VARIABLES:

ENV_FILE ?= .env.production
PROJECT ?= sgv_web
SETUP_MARKER ?= .setup-complete

# Export env vars từ file cấu hình
-include $(ENV_FILE)
export

# ── Docker Image Config (Cục bộ, nén .tar.gz gửi qua SSH, KHÔNG phụ thuộc registry ngoài) ──
IMAGE_NAME    ?= sgv-web-dong-duong
IMAGE_TAG     ?= latest
IMAGE         := $(IMAGE_NAME):$(IMAGE_TAG)
IMAGE_ARCHIVE := $(IMAGE_NAME)-$(IMAGE_TAG).tar.gz
ARCHIVE_PATH  := /tmp/$(IMAGE_ARCHIVE)

.PHONY: help dev build save deploy deploy-remote deploy-vps check-env setup infra-up up restart ps logs clean db-up db-down db-logs start-db wait-db first-run migration migration-remote migration-local migration-generate-remote migration-status db-dump db-dump-remote db-restore db-clone-remote db-push-remote seed-remote seed-vps seed-admin-remote fix-ssl-event

help: ## Hiển thị danh sách lệnh hỗ trợ
	@grep -h -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-26s\033[0m %s\n", $$1, $$2}'

# ============================================================
#  Local — Development & Container Management (chuẩn backend_dauthau)
# ============================================================

dev: ## Chạy local dev server với Docker Compose
	docker compose -p $(PROJECT) up $(args) -d $${SERVICE}

down: ## Dừng các container
	docker compose -p $(PROJECT) down

db-up: ## Khởi động dịch vụ PostgreSQL local/container
	docker compose -p $(PROJECT) up -d postgres
	@echo "✅ Database service (PostgreSQL) is running"

db-down: ## Dừng dịch vụ PostgreSQL
	docker compose -p $(PROJECT) stop postgres
	@echo "✅ Database service stopped"

db-logs: ## Xem logs thời gian thực của PostgreSQL
	docker compose -p $(PROJECT) logs -f postgres

start-db: db-up ## Alias cho db-up (tương thích backend_dauthau)

wait-db: ## Chờ PostgreSQL sẵn sàng kết nối (pg_isready)
	@echo "⏳ Waiting for PostgreSQL to be ready..."
	@until docker compose -p $(PROJECT) exec -T postgres pg_isready -U $${POSTGRES_USER:-sgv_admin} -d $${POSTGRES_DB:-sgv_cms} >/dev/null 2>&1; do \
		echo "   PostgreSQL is still starting..."; \
		sleep 2; \
	done
	@echo "✅ PostgreSQL is ready"

# ============================================================
#  Local — Build & Package (Không phụ thuộc Registry)
# ============================================================

build: ## Build Docker image tại máy local
	@echo "🔨 Building image with Site URL: $${NEXT_PUBLIC_SITE_URL:-https://indochinagroup.vn} ..."
	docker build \
		--build-arg NEXT_PUBLIC_SITE_URL=$${NEXT_PUBLIC_SITE_URL:-https://indochinagroup.vn} \
		--build-arg NEXT_PUBLIC_API_URL=$${NEXT_PUBLIC_API_URL:-/api} \
		-t $(IMAGE) .

save: build ## Build + đóng gói image thành .tar.gz để gửi qua SSH (không cần registry)
	@echo "💾 Saving image → $(ARCHIVE_PATH) ..."
	@docker save $(IMAGE) | gzip > $(ARCHIVE_PATH)
	@echo "✅ Saved: $(ARCHIVE_PATH) ($$(du -h $(ARCHIVE_PATH) | cut -f1))"

# ============================================================
#  Local → VPS — Remote Deploy (Chuẩn bảo vệ Dữ liệu Live)
# ============================================================

deploy: deploy-remote ## ⭐ Deploy code lên VPS (Build → Upload → Safe Start, KHÔNG đè database)

deploy-remote: save ## ⭐ Build → zip image → upload qua SSH (IP) → docker load + chạy an toàn
	@echo "===================================================="; \
	echo "  🚀 Deploy sgv-web-dong-duong to VPS (image qua .tar.gz)"; \
	echo "  📋 Config file : $(ENV_FILE)"; \
	echo "  🌐 Site URL     : $${NEXT_PUBLIC_SITE_URL:-https://indochinagroup.vn}"; \
	echo "  🔗 APP_URL      : $${APP_URL:-https://indochinagroup.vn}"; \
	echo "  📦 Archive      : $(IMAGE_ARCHIVE)"; \
	echo "===================================================="; \
	if [ -n "$(VPS_HOST)" ] && [ -n "$(VPS_USER)" ] && [ -n "$(VPS_PATH)" ]; then \
		vps_host="$(VPS_HOST)"; \
		vps_user="$(VPS_USER)"; \
		vps_path="$(VPS_PATH)"; \
		echo "📋 Using saved VPS config: $$vps_user@$$vps_host:$$vps_path"; \
	else \
		read -p "🌐 VPS Host (IP or domain): " vps_host; \
		read -p "👤 VPS User [root]: " vps_user; \
		vps_user=$${vps_user:-root}; \
		read -p "📁 Deploy path [~/sgv_web]: " vps_path; \
		vps_path=$${vps_path:-\$$HOME/sgv_web}; \
	fi; \
	echo ""; \
	SOCK="/tmp/ssh-deploy-$$$$"; \
	trap "ssh -o ControlPath=$$SOCK -O exit $$vps_user@$$vps_host 2>/dev/null; rm -f $$SOCK $(ARCHIVE_PATH)" EXIT; \
	echo "🔑 Connecting to $$vps_user@$$vps_host..."; \
	ssh -o ControlMaster=yes -o ControlPath=$$SOCK -o ControlPersist=120 -fN $$vps_user@$$vps_host; \
	SSH="ssh -o ControlPath=$$SOCK"; \
	SCP="scp -o ControlPath=$$SOCK"; \
	$$SSH $$vps_user@$$vps_host "mkdir -p $$vps_path"; \
	abs_path=$$($$SSH $$vps_user@$$vps_host "cd $$vps_path && pwd"); \
	[ -n "$$abs_path" ] || { echo "❌ Không resolve được deploy path trên VPS"; exit 1; }; \
	echo "📦 Uploading image + config + scripts → $$abs_path..."; \
	$$SCP -r Makefile docker-compose.yml scripts $(ARCHIVE_PATH) $$vps_user@$$vps_host:$$abs_path/; \
	$$SCP $(ENV_FILE) $$vps_user@$$vps_host:$$abs_path/.env; \
	echo "✅ Uploaded!"; \
	echo ""; \
	echo "🔧 Running safe deploy-vps on remote..."; \
	$$SSH -t $$vps_user@$$vps_host "cd $$abs_path && make deploy-vps && rm -f $(IMAGE_ARCHIVE)"

# ============================================================
#  VPS — Setup, Load Image & Safe Start (Chuẩn backend_dauthau)
# ============================================================

check-env: ## Kiểm tra file cấu hình .env tồn tại
	@if [ ! -f .env ]; then \
		echo "❌ .env not found! Run 'make deploy' from local to upload config."; \
		exit 1; \
	else \
		echo "✅ .env found."; \
	fi

infra-up: ## Khởi động database services (Postgres) trước
	docker compose -p $(PROJECT) up -d postgres
	@echo "✅ Infrastructure service (PostgreSQL) is running"

load: ## Load image từ file $(IMAGE_ARCHIVE) đã upload
	@if [ -f "$(IMAGE_ARCHIVE)" ]; then \
		echo "📦 Loading Docker image $(IMAGE_ARCHIVE)..."; \
		docker load -i $(IMAGE_ARCHIVE); \
	else \
		echo "ℹ️  Không tìm thấy $(IMAGE_ARCHIVE), sử dụng image hiện có."; \
	fi

first-run: wait-db ## Kiểm tra & khởi tạo DB lần đầu (BẢO VỆ TUYỆT ĐỐI dữ liệu đang có, KHÔNG ghi đè)
	@set -e; \
	if [ -f "$(SETUP_MARKER)" ]; then \
		echo "🛡️  Dữ liệu an toàn: Marker $(SETUP_MARKER) đã tồn tại ($$(cat $(SETUP_MARKER))). Bỏ qua nạp seed."; \
	else \
		has_tables=$$(docker compose -p $(PROJECT) exec -T postgres psql -U $${POSTGRES_USER:-sgv_admin} -d $${POSTGRES_DB:-sgv_cms} -tAc "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null || echo 0); \
		if [ "$$has_tables" -gt 5 ]; then \
			echo "🛡️  Đã phát hiện database đang chạy với $$has_tables bảng! BẢO VỆ DỮ LIỆU ĐANG CÓ, KHÔNG GHI ĐÈ."; \
			date -Iseconds > "$(SETUP_MARKER)"; \
			echo "✅ Đã đánh dấu $(SETUP_MARKER). Toàn bộ dữ liệu admin/cms được giữ nguyên 100%."; \
		else \
			echo "🚀 Khởi tạo database lần đầu cho VPS trống..."; \
			if [ -f scripts/sgv_cms_master_dump.sql ]; then \
				docker exec -i sgv_postgres psql -U postgres -d $${POSTGRES_DB:-sgv_cms} < scripts/sgv_cms_master_dump.sql; \
			fi; \
			date -Iseconds > "$(SETUP_MARKER)"; \
			echo "✅ Khởi tạo database thành công. Đã tạo marker $(SETUP_MARKER)."; \
		fi; \
	fi

setup: check-env ## Chuẩn bị môi trường: kiểm tra env, chạy DB infra, kiểm tra first-run an toàn
	@$(MAKE) infra-up
	@$(MAKE) first-run

up: ## Start toàn bộ containers
	docker compose -p $(PROJECT) up -d
	@echo "✅ SaigonValve Web is up and running on port $${WEB_HOST_PORT:-3001}"

restart: ## Khởi động lại container web
	docker compose -p $(PROJECT) restart web
	@echo "🔄 SaigonValve Web container restarted"

deploy-vps: setup load up ## Setup an toàn + Load image + Khởi chạy trên VPS
	@echo "✅ VPS deploy completed! Code đã cập nhật, Database được bảo toàn nguyên vẹn."

ps: ## Xem trạng thái containers đang chạy
	docker compose -p $(PROJECT) ps

logs: ## Xem logs thời gian thực của web container
	docker compose -p $(PROJECT) logs -f --tail=100 web

clean: ## Dọn dẹp containers và images cũ (BẢO TOÀN Volume Dữ liệu DB & Uploads)
	docker compose -p $(PROJECT) down --rmi local
	@echo "🧹 Cleaned up containers and images. (Named Volumes sgv_postgres_data & sgv_uploads_data preserved safely)."

# ============================================================
#  Database Migrations & Management (Chuẩn kiến trúc như Event)
# ============================================================

migration: migration-remote ## ⭐ Chạy Migration trên DB REMOTE (qua SSH tunnel, tự nhập VPS/DB)

migration-remote: ## ⭐ Drizzle Migration trên DB REMOTE qua SSH tunnel (run pending / generate / push / status)
	@bash ./scripts/migration-remote.sh

migration-local: ## Drizzle Migration trên DB LOCAL (run pending / generate / push / status)
	@bash ./scripts/migration-local.sh

migration-generate-remote: ## ⭐ CHỈ generate file migration .sql từ diff schema ↔ DB REMOTE (Read-only, không sửa DB)
	@bash ./scripts/migration-generate-remote.sh

migration-status: ## Kiểm tra danh sách bảng & trạng thái migration trên DB Remote
	@bash ./scripts/migration-remote.sh <<< "4"

# ============================================================
#  Database Backup & Clone (Remote ↔ Local)
# ============================================================

db-dump: ## Dump DB của container LOCAL (sgv_postgres) → backups/local-<ts>.dump
	@bash ./scripts/db-dump.sh

db-dump-remote: ## ⭐ Backup DB REMOTE (VPS): SSH → pg_dump container sgv_postgres → tải về backups/
	@bash ./scripts/db-dump-remote.sh

db-restore: ## Restore dump vào local DB (RESET DB). Usage: make db-restore FILE=backups/x.dump
	@bash ./scripts/db-restore-local.sh "$(FILE)"

db-clone-remote: ## SSH vào VPS → dump DB remote → nạp vào local (clone toàn bộ data về local)
	@bash ./scripts/db-clone-remote.sh

# ============================================================
#  Database Manual Seeds & RBAC (Có cảnh báo bảo vệ dữ liệu)
# ============================================================

db-push-remote: ## ⭐ Chạy Drizzle push trực tiếp trong container VPS
	@if [ -n "$(VPS_HOST)" ] && [ -n "$(VPS_USER)" ] && [ -n "$(VPS_PATH)" ]; then \
		vps_host="$(VPS_HOST)"; \
		vps_user="$(VPS_USER)"; \
		vps_path="$(VPS_PATH)"; \
	else \
		read -p "🌐 VPS Host (IP or domain): " vps_host; \
		read -p "👤 VPS User [root]: " vps_user; \
		vps_user=$${vps_user:-root}; \
		read -p "📁 Deploy path [~/sgv_web]: " vps_path; \
		vps_path=$${vps_path:-\$$HOME/sgv_web}; \
	fi; \
	echo "🚀 Running drizzle-kit push on remote VPS..."; \
	ssh $$vps_user@$$vps_host "cd $$vps_path && docker compose -p $(PROJECT) run --rm web npx drizzle-kit push"

seed-remote: ## ⚠️  Nạp đè dữ liệu mẫu & tài khoản admin lên VPS PostgreSQL (Yêu cầu xác nhận)
	@vps_host="$(VPS_HOST)"; \
	vps_user="$(VPS_USER)"; \
	vps_path="$(VPS_PATH)"; \
	[ -n "$$vps_host" ] || read -p "🌐 VPS Host (IP or domain): " vps_host; \
	[ -n "$$vps_user" ] || read -p "👤 VPS User [root]: " vps_user; \
	vps_user=$${vps_user:-root}; \
	[ -n "$$vps_path" ] || read -p "📁 Deploy path [~/sgv_web]: " vps_path; \
	vps_path=$${vps_path:-\$$HOME/sgv_web}; \
	echo "⚠️  CẢNH BÁO QUAN TRỌNG: Lệnh này sẽ NẠP ĐÈ toàn bộ dữ liệu mẫu lên VPS ($$vps_host)!"; \
	read -p "👉 Bạn có chắc chắn muốn nạp đè dữ liệu? (gõ đúng 'yes' để tiếp tục): " confirm; \
	if [ "$$confirm" != "yes" ]; then \
		echo "❌ Đã hủy thao tác seed để bảo vệ dữ liệu hiện tại."; \
		exit 0; \
	fi; \
	echo "🌱 Đang nạp toàn bộ dữ liệu & tài khoản admin vào container sgv_postgres trên VPS..."; \
	cat scripts/sgv_cms_master_dump.sql | ssh $$vps_user@$$vps_host "docker exec -i sgv_postgres psql -U postgres -d $${POSTGRES_DB:-sgv_cms}" || { echo "❌ Nạp dữ liệu thất bại!"; exit 1; }; \
	echo "===================================================="; \
	echo "✅ NẠP DỮ LIỆU THÀNH CÔNG VÀO VPS POSTGRESQL!"; \
	echo "🔄 Khởi động lại web container để nhận kết nối DB..."; \
	ssh $$vps_user@$$vps_host "cd $$vps_path && docker compose -p $(PROJECT) restart web"; \
	echo "🔑 Thông tin tài khoản đăng nhập:"; \
	echo "   1. Admin       : $${SEED_ADMIN_USERNAME:-admin} / $${SEED_ADMIN_PASSWORD:-admin123}"; \
	echo "   2. Super Admin : $${SUPER_ADMIN_USERNAME:-superadmin} / $${SUPER_ADMIN_PASSWORD:-Super@123}"; \
	echo "===================================================="

seed-vps: ## ⚠️  Nạp database trực tiếp trên VPS (Chạy thủ công khi đã SSH vào VPS)
	@echo "⚠️  CẢNH BÁO: Lệnh này sẽ NẠP ĐÈ database từ scripts/sgv_cms_master_dump.sql!"
	@read -p "👉 Gõ 'yes' để xác nhận: " confirm; \
	if [ "$$confirm" != "yes" ]; then \
		echo "❌ Đã hủy thao tác seed."; \
		exit 0; \
	fi
	docker exec -i sgv_postgres psql -U postgres -d $${POSTGRES_DB:-sgv_cms} < scripts/sgv_cms_master_dump.sql
	docker compose -p $(PROJECT) restart web
	@echo "===================================================="
	@echo "✅ NẠP DỮ LIỆU THÀNH CÔNG!"
	@echo "🔑 Thông tin tài khoản đăng nhập:"
	@echo "   1. Admin       : $${SEED_ADMIN_USERNAME:-admin} / $${SEED_ADMIN_PASSWORD:-admin123}"
	@echo "   2. Super Admin : $${SUPER_ADMIN_USERNAME:-superadmin} / $${SUPER_ADMIN_PASSWORD:-Super@123}"
	@echo "===================================================="

seed-admin-remote: ## Cập nhật/seed lại tài khoản admin & RBAC từ .env lên VPS
	@if [ -n "$(VPS_HOST)" ] && [ -n "$(VPS_USER)" ] && [ -n "$(VPS_PATH)" ]; then \
		vps_host="$(VPS_HOST)"; \
		vps_user="$(VPS_USER)"; \
		vps_path="$(VPS_PATH)"; \
	else \
		read -p "🌐 VPS Host (IP or domain): " vps_host; \
		read -p "👤 VPS User [root]: " vps_user; \
		vps_user=$${vps_user:-root}; \
		read -p "📁 Deploy path [~/sgv_web]: " vps_path; \
		vps_path=$${vps_path:-\$$HOME/sgv_web}; \
	fi; \
	echo "🔑 Seeding Admin & RBAC on VPS..."; \
	ssh $$vps_user@$$vps_host "cd $$vps_path && docker run --rm --network sgv_network -v \$$(pwd)/scripts:/scripts --env-file .env node:22-alpine sh -c 'cd /scripts && npm install --silent pg bcryptjs dotenv && node seed_admin_rbac.js'"; \
	echo "✅ Seed admin & RBAC completed!"

# ============================================================
#  SSL & Infrastructure Utilities
# ============================================================

fix-ssl-event: ## 🚑 Khôi phục SSL Let's Encrypt cho event.saigonvalve.vn
	@vps_host="$(VPS_HOST)"; \
	vps_user="$(VPS_USER)"; \
	[ -n "$$vps_host" ] || vps_host="14.241.237.132"; \
	[ -n "$$vps_user" ] || vps_user="sgv"; \
	echo "🚑 Đang kết nối tới $$vps_user@$$vps_host để khôi phục SSL cho event.saigonvalve.vn..."; \
	ssh -t $$vps_user@$$vps_host 'docker exec sgv-proxy sh -c " \
		echo \"====================================================\"; \
		echo \"🔍 1. Kiểm tra chứng chỉ hiện có trên VPS...\"; \
		ls -la /etc/letsencrypt/live/ 2>/dev/null || true; \
		echo \"====================================================\"; \
		echo \"🔒 2. Xin cấp chứng chỉ SAN đa tên miền để vượt qua Rate Limit Let'\''s Encrypt...\"; \
		certbot certonly --webroot -w /var/www/certbot \
			--cert-name sgv-unified-ssl \
			-d event.saigonvalve.vn \
			-d event-apis.saigonvalve.vn \
			-d event-scada.saigonvalve.vn \
			-d event-gis.saigonvalve.vn \
			-d event-scada-apis.saigonvalve.vn \
			-d indochinagroup.vn \
			--email admin@saigonvalve.vn \
			--agree-tos --no-eff-email \
			--non-interactive \
			--key-type rsa \
			--rsa-key-size 4096 2>&1 || true; \
		if [ -f /etc/letsencrypt/live/sgv-unified-ssl/fullchain.pem ]; then \
			echo \"✅ Đã nhận chứng chỉ thành công từ Let'\''s Encrypt!\"; \
			for d in event.saigonvalve.vn event-apis.saigonvalve.vn event-scada.saigonvalve.vn event-gis.saigonvalve.vn event-scada-apis.saigonvalve.vn indochinagroup.vn; do \
				mkdir -p /etc/nginx/certs/live/\$$d; \
				cp -fL /etc/letsencrypt/live/sgv-unified-ssl/fullchain.pem /etc/nginx/certs/live/\$$d/fullchain.pem; \
				cp -fL /etc/letsencrypt/live/sgv-unified-ssl/privkey.pem /etc/nginx/certs/live/\$$d/privkey.pem; \
			done; \
			nginx -s reload; \
			echo \"====================================================\"; \
			echo \"🎉 KHÔI PHỤC THÀNH CÔNG CHỨNG CHỈ SSL CHO TẤT CẢ DOMAIN!\"; \
			echo \"👉 Mời bạn F5 lại https://event.saigonvalve.vn/login\"; \
			echo \"====================================================\"; \
		fi; \
	"'
