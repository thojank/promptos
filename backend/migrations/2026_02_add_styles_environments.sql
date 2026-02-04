-- Add styles and environments tables
CREATE TABLE IF NOT EXISTS styles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    style_json JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID
);

CREATE INDEX IF NOT EXISTS idx_styles_title ON styles(title);

CREATE TABLE IF NOT EXISTS environments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    environment_json JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID
);

CREATE INDEX IF NOT EXISTS idx_environments_title ON environments(title);
