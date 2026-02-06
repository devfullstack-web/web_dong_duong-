.PHONY: help env clean dev prod install install-dev install-prod

# Configuration
DEV_BRANCH = dev
PROD_BRANCH = prod
HOST_SERVER = store.saigonvalve.vn
BRANCH ?= dev

help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

env: ## Generate .env file from conf/setup.conf
	@if [ ! -f conf/setup.conf ]; then \
		echo "Error: conf/setup.conf not found!"; \
		exit 1; \
	fi
	@cp conf/setup.conf .env
	@echo ".env file generated successfully!"

install: ## Install app for specific branch (use: make install BRANCH=dev or make install BRANCH=prod)
	@echo "Installing SGV CMS for branch: $(BRANCH)..."
	@echo "Step 1: Checking out branch $(BRANCH)..."
	@git fetch origin
	@git checkout $(BRANCH)
	@git pull origin $(BRANCH)
	@echo "Step 2: Generating .env file..."
	@$(MAKE) env
	@echo "Step 3: Building Docker containers..."
	@docker compose build
	@echo "Step 4: Starting services..."
	@docker compose up -d
	@echo "Installation complete! Services are running."
	@echo "Run 'docker compose logs -f' to view logs."

install-dev: ## Install and deploy development environment
	@$(MAKE) install BRANCH=$(DEV_BRANCH)

install-prod: ## Install and deploy production environment
	@$(MAKE) install BRANCH=$(PROD_BRANCH)

dev: ## Setup development environment (switch to dev branch and install)
	@echo "Setting up development environment..."
	@git fetch origin
	@git checkout $(DEV_BRANCH)
	@git pull origin $(DEV_BRANCH)
	@echo "Installing dependencies..."
	@pnpm install
	@echo "Development environment ready!"

prod: ## Setup production environment (switch to prod branch and install)
	@echo "Setting up production environment..."
	@git fetch origin
	@git checkout $(PROD_BRANCH)
	@git pull origin $(PROD_BRANCH)
	@echo "Installing dependencies..."
	@pnpm install
	@echo "Production environment ready!"

clean: ## Remove generated .env file
	@rm -f .env
	@echo ".env file removed"
