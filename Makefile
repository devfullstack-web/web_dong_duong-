# ============================================================
#  SGV Web Dong Duong (Next.js Fullstack) — Docker Build & Deploy
#  Pattern chuẩn: Local build → Save .tar.gz → SSH Upload → Load & Run
# ============================================================

.EXPORT_ALL_VARIABLES:

ENV_FILE ?= .env.production
-include $(ENV_FILE)
export

# Docker image config (Cục bộ, nén .tar.gz gửi qua SSH, KHÔNG phụ thuộc registry ngoài)
IMAGE_NAME    ?= sgv-web-dong-duong
IMAGE_TAG     ?= latest
IMAGE         := $(IMAGE_NAME):$(IMAGE_TAG)
IMAGE_ARCHIVE := $(IMAGE_NAME)-$(IMAGE_TAG).tar.gz
ARCHIVE_PATH  := /tmp/$(IMAGE_ARCHIVE)

.PHONY: all help build save deploy deploy-remote deploy-vps setup load up down restart logs ps clean db-push-remote seed-remote seed-vps seed-admin-remote fix-ssl-event migration migration-remote migration-local migration-generate-remote migration-status db-dump db-dump-remote db-restore db-clone-remote

all: help

help: ## Show available commands
	@grep -h -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-26s\033[0m %s\n", $$1, $$2}'

# ============================================================
#  Local — Build & Package
# ============================================================

build: ## Build Docker image locally
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
#  Local → VPS — Remote Deploy
# ============================================================

deploy: deploy-remote ## ⭐ Build + upload VPS qua SSH + tự start (make deploy)

deploy-remote: save ## ⭐ Build → zip image → upload qua SSH (IP) → docker load + chạy (KHÔNG registry)
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
	echo "📦 Uploading image + config + scripts → $$abs_path (có thể mất 1-2 phút tùy mạng)..."; \
	$$SCP -r Makefile docker-compose.yml scripts $(ARCHIVE_PATH) $$vps_user@$$vps_host:$$abs_path/; \
	$$SCP $(ENV_FILE) $$vps_user@$$vps_host:$$abs_path/.env; \
	echo "✅ Uploaded!"; \
	echo ""; \
	echo "🔧 docker load + start trên remote..."; \
	$$SSH -t $$vps_user@$$vps_host "cd $$abs_path && make deploy-vps && rm -f $(IMAGE_ARCHIVE)"

# ============================================================
#  VPS — Load image & Run
# ============================================================

setup: ## Check .env exists
	@if [ ! -f .env ]; then \
		echo "❌ .env not found! Run 'make deploy' from local to upload config."; \
		exit 1; \
	else \
		echo "✅ .env found."; \
	fi

load: ## Load image từ file $(IMAGE_ARCHIVE) đã upload (chạy trên VPS)
	docker load -i $(IMAGE_ARCHIVE)

up: ## Start the container
	docker compose up -d
	@echo "✅ SaigonValve Web is running on port $${WEB_HOST_PORT:-3001}"

down: ## Stop the container
	docker compose down

deploy-vps: setup load up ## Load image + Start (chạy trên VPS sau khi đã upload)

restart: ## Restart web container
	docker compose restart web
	@echo "🔄 SaigonValve Web container restarted"

logs: ## Show container logs (follow)
	docker compose logs -f --tail=100

ps: ## Show container status
	docker compose ps

clean: ## Remove containers and images
	docker compose down --rmi local -v 2>/dev/null || true
	@echo "🧹 Cleaned up"

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
#  Database Legacy Seeds & Drizzle Push Remote
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
	ssh $$vps_user@$$vps_host "cd $$vps_path && docker compose run --rm web npx drizzle-kit push"

seed-remote: ## ⭐ Nạp toàn bộ dữ liệu mẫu & tài khoản admin từ Local lên VPS PostgreSQL
	@vps_host="$(VPS_HOST)"; \
	vps_user="$(VPS_USER)"; \
	vps_path="$(VPS_PATH)"; \
	[ -n "$$vps_host" ] || read -p "🌐 VPS Host (IP or domain): " vps_host; \
	[ -n "$$vps_user" ] || read -p "👤 VPS User [root]: " vps_user; \
	vps_user=$${vps_user:-root}; \
	[ -n "$$vps_path" ] || read -p "📁 Deploy path [~/sgv_web]: " vps_path; \
	vps_path=$${vps_path:-\$$HOME/sgv_web}; \
	echo "🌱 Đang nạp toàn bộ dữ liệu & tài khoản admin vào container sgv_postgres trên VPS..."; \
	cat scripts/sgv_cms_master_dump.sql | ssh $$vps_user@$$vps_host "docker exec -i sgv_postgres psql -U postgres -d $${POSTGRES_DB:-sgv_cms}" || { echo "❌ Nạp dữ liệu thất bại!"; exit 1; }; \
	echo "===================================================="; \
	echo "✅ NẠP DỮ LIỆU THÀNH CÔNG VÀO VPS POSTGRESQL!"; \
	echo "🔄 Khởi động lại web container để nhận kết nối DB..."; \
	ssh $$vps_user@$$vps_host "cd $$vps_path && docker compose restart web"; \
	echo "🔑 Thông tin tài khoản đăng nhập:"; \
	echo "   1. Admin       : $${SEED_ADMIN_USERNAME:-admin} / $${SEED_ADMIN_PASSWORD:-admin123}"; \
	echo "   2. Super Admin : $${SUPER_ADMIN_USERNAME:-superadmin} / $${SUPER_ADMIN_PASSWORD:-Super@123}"; \
	echo "===================================================="

seed-vps: ## Nạp database trực tiếp trên VPS (chạy lệnh này khi đã SSH vào VPS tại ~/sgv_web)
	@echo "🌱 Đang nạp database từ scripts/sgv_cms_master_dump.sql..."
	docker exec -i sgv_postgres psql -U postgres -d $${POSTGRES_DB:-sgv_cms} < scripts/sgv_cms_master_dump.sql
	docker compose restart web
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

fix-ssl-event: ## 🚑 Khôi phục SSL Let's Encrypt cho event.saigonvalve.vn (Bypass rate limit bằng SAN cert)
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
		else \
			echo \"⚠️  Đang thử gói 3 domain (event + apis + indochinagroup)...\"; \
			certbot certonly --webroot -w /var/www/certbot \
				--cert-name sgv-event-alt \
				-d event.saigonvalve.vn \
				-d event-apis.saigonvalve.vn \
				-d indochinagroup.vn \
				--email admin@saigonvalve.vn \
				--agree-tos --no-eff-email \
				--non-interactive 2>&1 || true; \
			if [ -f /etc/letsencrypt/live/sgv-event-alt/fullchain.pem ]; then \
				for d in event.saigonvalve.vn event-apis.saigonvalve.vn; do \
					mkdir -p /etc/nginx/certs/live/\$$d; \
					cp -fL /etc/letsencrypt/live/sgv-event-alt/fullchain.pem /etc/nginx/certs/live/\$$d/fullchain.pem; \
					cp -fL /etc/letsencrypt/live/sgv-event-alt/privkey.pem /etc/nginx/certs/live/\$$d/privkey.pem; \
				done; \
				nginx -s reload; \
				echo \"🎉 Khôi phục SSL thành công cho event.saigonvalve.vn!\"; \
			else \
				echo \"❌ Cần kiểm tra chi tiết log certbot tại /var/log/letsencrypt/letsencrypt.log\"; \
			fi; \
		fi; \
	"'
