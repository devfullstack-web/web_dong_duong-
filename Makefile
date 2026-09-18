# ============================================================
#  SGV Web Dong Duong (Next.js Fullstack) — Docker Build & Deploy
#  Pattern chuẩn: Local build → Save .tar.gz → SSH Upload → Load & Run
# ============================================================

.EXPORT_ALL_VARIABLES:

ENV_FILE ?= .env
-include $(ENV_FILE)
export

# Docker image config (Cục bộ, nén .tar.gz gửi qua SSH, KHÔNG phụ thuộc registry ngoài)
IMAGE_NAME    ?= sgv_web
IMAGE_TAG     ?= latest
IMAGE         := $(IMAGE_NAME):$(IMAGE_TAG)
IMAGE_ARCHIVE := $(IMAGE_NAME)-$(IMAGE_TAG).tar.gz
ARCHIVE_PATH  := /tmp/$(IMAGE_ARCHIVE)

.PHONY: all help build save deploy deploy-remote deploy-vps setup load up down restart logs ps clean db-push-remote seed-remote

all: help

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-25s\033[0m %s\n", $$1, $$2}'

# ============================================================
#  Local — Build & Package
# ============================================================

build: ## Build Docker image locally
	docker build \
		--build-arg NEXT_PUBLIC_SITE_URL=$${NEXT_PUBLIC_SITE_URL:-https://saigonvalve.vn} \
		--build-arg NEXT_PUBLIC_API_URL=$${NEXT_PUBLIC_API_URL:-https://saigonvalve.vn/api} \
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
	echo "  🚀 Deploy sgv_web_dong_duong to VPS (image qua .tar.gz)"; \
	echo "  📋 Env: $(ENV_FILE)   |   📦 $(IMAGE_ARCHIVE)"; \
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
	echo "📦 Uploading image + config → $$abs_path (có thể mất 1-2 phút tùy mạng)..."; \
	$$SCP Makefile docker-compose.yml $(ARCHIVE_PATH) $$vps_user@$$vps_host:$$abs_path/; \
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
#  Database Migrations & Seed Remote
# ============================================================

db-push-remote: ## ⭐ Chạy Drizzle migration trên VPS (push schema vào PostgreSQL remote)
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

seed-remote: ## Chạy seed data trên VPS
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
	echo "🌱 Running seed master on remote VPS..."; \
	ssh $$vps_user@$$vps_host "cd $$vps_path && docker compose run --rm web node scripts/seed_dongduong_master.js"
