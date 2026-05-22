-- Add missing columns to categories table
ALTER TABLE categories ADD COLUMN IF NOT EXISTS name_localized jsonb;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES categories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);
CREATE INDEX IF NOT EXISTS idx_categories_type_parent ON categories(category_type_id, parent_id);

-- Add missing columns to products table (localized & enhanced fields)
ALTER TABLE products ADD COLUMN IF NOT EXISTS name_localized jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS description_localized jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS tech_specs jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS tech_specs_localized jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS features jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS features_localized jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS gallery jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS tech_summary TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS tech_summary_localized jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS catalog_url VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS warranty VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS origin VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS availability VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS delivery_info VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
