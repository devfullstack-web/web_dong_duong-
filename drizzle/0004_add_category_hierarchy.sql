-- Add hierarchy, display order and visibility to categories

ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES categories(id) ON DELETE SET NULL;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT true;

-- Index for parent_id lookups (tree queries)
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);

-- Index for sorting by display_order
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);

-- Composite index for type + parent (common query pattern)
CREATE INDEX IF NOT EXISTS idx_categories_type_parent ON categories(category_type_id, parent_id);
