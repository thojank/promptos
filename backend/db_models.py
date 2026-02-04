"""
PostgreSQL/Supabase Datenbank-Schema für Z-Image-Turbo Prompt Platform

Tabellen:
1. character_profiles - Wiederverwendbare Character-Templates
2. scenes - Szenen-Module (Setting, Lighting, etc.)
3. stories - Container für narrative Sequenzen
4. prompts - Einzelne, assemblierte Prompts (Character + Scene + Action)
5. text_elements - Text-Elemente für Bilder (separiert für Flexibilität)
6. global_assets - Story-weite Parameter (Style Overrides, etc.)
"""

# ============================================================================
# SQL SCHEMA (PostgreSQL)
# ============================================================================

SQL_SCHEMA = """
-- Character Profiles (wiederverwendbar)
CREATE TABLE IF NOT EXISTS character_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    identity_name VARCHAR(255) NOT NULL,
    identity_age INT NOT NULL CHECK (identity_age >= 1 AND identity_age <= 120),
    identity_background TEXT NOT NULL,
    
    -- Physische Deskriptoren
    skin_tone VARCHAR(100),
    hair VARCHAR(150),
    facial_structure VARCHAR(100),
    eyes VARCHAR(150),
    additional_features TEXT,
    
    -- Kleidung & Notes
    clothing TEXT NOT NULL,
    special_notes TEXT,
    
    -- Metadaten
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID,  -- User ID (später)
    
    CONSTRAINT unique_character_identity UNIQUE(name, identity_age, identity_background)
);

CREATE INDEX idx_character_name ON character_profiles(name);
CREATE INDEX idx_character_created ON character_profiles(created_at DESC);


-- Scene Modules (austauschbar)
CREATE TABLE IF NOT EXISTS scene_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    setting TEXT NOT NULL,
    lighting VARCHAR(100) NOT NULL,
    lighting_details TEXT,
    atmosphere TEXT NOT NULL,
    composition TEXT NOT NULL,
    technical_specs TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID,
    
    CONSTRAINT check_lighting_enum CHECK (lighting IN (
        'soft daylight', 'overcast sky', 'sharp shadows', 'golden hour sun',
        'diffused window light', 'harsh midday sun', 'warm incandescent glow',
        'cool fluorescent light', 'rim lighting from behind', 'dappled light through leaves'
    ))
);

CREATE INDEX idx_scene_title ON scene_modules(title);
CREATE INDEX idx_scene_lighting ON scene_modules(lighting);


-- Style Presets (wiederverwendbar)
CREATE TABLE IF NOT EXISTS styles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    style_json JSONB NOT NULL,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID
);

CREATE INDEX idx_styles_title ON styles(title);


-- Environments (Orte/Settings)
CREATE TABLE IF NOT EXISTS environments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    environment_json JSONB NOT NULL,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID
);

CREATE INDEX idx_environments_title ON environments(title);


-- Text Elements (separat für Wiederverwendung)
CREATE TABLE IF NOT EXISTS text_elements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content VARCHAR(500) NOT NULL,
    font_style VARCHAR(150) NOT NULL,
    placement VARCHAR(150) NOT NULL,
    size VARCHAR(100),
    surface_material VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT NOW()
);


-- Stories (Container für Prompt-Sequenzen)
CREATE TABLE IF NOT EXISTS stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Global Assets (Style-Overrides)
    global_style_preset VARCHAR(100),
    global_color_grading TEXT,
    global_atmosphere_override TEXT,
    
    -- Metadaten
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID,
    is_published BOOLEAN DEFAULT FALSE,
    
    INDEX idx_story_title ON stories(title),
    INDEX idx_story_created ON stories(created_at DESC)
);


-- Prompts (Kombinationen: Character + Scene + Action + Text)
CREATE TABLE IF NOT EXISTS prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL,
    sequence_number INT,
    
    -- References zu Components
    character_id UUID NOT NULL REFERENCES character_profiles(id),
    scene_id UUID NOT NULL REFERENCES scene_modules(id),
    action TEXT NOT NULL,
    pose_details TEXT,
    
    -- Metadaten
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Finale Output
    final_prompt_text LONGTEXT,  -- Der 600-1000 Wort Prompt
    word_count INT,
    validation_passed BOOLEAN,
    forbidden_words_found TEXT,
    
    FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE,
    CONSTRAINT unique_story_sequence UNIQUE(story_id, sequence_number)
);

CREATE INDEX idx_prompt_story ON prompts(story_id);
CREATE INDEX idx_prompt_character ON prompts(character_id);
CREATE INDEX idx_prompt_scene ON prompts(scene_id);
CREATE INDEX idx_prompt_sequence ON prompts(story_id, sequence_number);


-- Prompt_to_TextElements (Many-to-Many)
CREATE TABLE IF NOT EXISTS prompt_text_elements (
    prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
    text_element_id UUID NOT NULL REFERENCES text_elements(id) ON DELETE CASCADE,
    PRIMARY KEY (prompt_id, text_element_id)
);


-- Story Versions (für Versionskontrolle)
CREATE TABLE IF NOT EXISTS story_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    global_assets_snapshot JSON,  -- Snapshot der globalen Assets zu diesem Zeitpunkt
    prompts_snapshot JSON,  -- Snapshot aller Prompts
    created_at TIMESTAMP DEFAULT NOW(),
    created_by UUID,
    
    CONSTRAINT unique_story_version UNIQUE(story_id, version_number)
);

CREATE INDEX idx_version_story ON story_versions(story_id, version_number DESC);
"""


# ============================================================================
# PYTHON DATENBANK-MODELLE (SQLAlchemy)
# ============================================================================

from sqlalchemy import Column, String, Integer, Text, DateTime, Boolean, ForeignKey, Table, Enum as SQLEnum, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

Base = declarative_base()


class CharacterProfile(Base):
    """Character Profile Tabelle"""
    __tablename__ = "character_profiles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    identity_name = Column(String(255), nullable=False)
    identity_age = Column(Integer, nullable=False)
    identity_background = Column(Text, nullable=False)
    
    skin_tone = Column(String(100))
    hair = Column(String(150))
    facial_structure = Column(String(100))
    eyes = Column(String(150))
    additional_features = Column(Text)
    
    clothing = Column(Text, nullable=False)
    special_notes = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String(255))
    
    # Relationships
    prompts = relationship("Prompt", back_populates="character")


class SceneModule(Base):
    """Scene Module Tabelle"""
    __tablename__ = "scene_modules"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    setting = Column(Text, nullable=False)
    lighting = Column(String(100), nullable=False)
    lighting_details = Column(Text)
    atmosphere = Column(Text, nullable=False)
    composition = Column(Text, nullable=False)
    technical_specs = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String(255))
    
    # Relationships
    prompts = relationship("Prompt", back_populates="scene")


class StylePreset(Base):
    """Style Preset Tabelle"""
    __tablename__ = "styles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    style_json = Column(JSON, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String(255))


class EnvironmentPreset(Base):
    """Environment Preset Tabelle"""
    __tablename__ = "environments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    environment_json = Column(JSON, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String(255))


class TextElement(Base):
    """Text Element Tabelle"""
    __tablename__ = "text_elements"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content = Column(String(500), nullable=False)
    font_style = Column(String(150), nullable=False)
    placement = Column(String(150), nullable=False)
    size = Column(String(100))
    surface_material = Column(String(100))
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships (Many-to-Many durch PromptTextElement)
    prompts = relationship("Prompt", secondary="prompt_text_elements", back_populates="text_elements")


class Story(Base):
    """Story Container Tabelle"""
    __tablename__ = "stories"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    
    global_style_preset = Column(String(100))
    global_color_grading = Column(Text)
    global_atmosphere_override = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String(255))
    is_published = Column(Boolean, default=False)
    
    # Relationships
    prompts = relationship("Prompt", back_populates="story", cascade="all, delete-orphan")
    versions = relationship("StoryVersion", back_populates="story", cascade="all, delete-orphan")


class Prompt(Base):
    """Einzelner Prompt (Kombination von Components)"""
    __tablename__ = "prompts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    story_id = Column(UUID(as_uuid=True), ForeignKey("stories.id", ondelete="CASCADE"), nullable=False)
    sequence_number = Column(Integer)
    
    character_id = Column(UUID(as_uuid=True), ForeignKey("character_profiles.id"), nullable=False)
    scene_id = Column(UUID(as_uuid=True), ForeignKey("scene_modules.id"), nullable=False)
    action = Column(Text, nullable=False)
    pose_details = Column(Text)
    
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    final_prompt_text = Column(Text)
    word_count = Column(Integer)
    validation_passed = Column(Boolean)
    forbidden_words_found = Column(Text)
    
    # Relationships
    story = relationship("Story", back_populates="prompts")
    character = relationship("CharacterProfile", back_populates="prompts")
    scene = relationship("SceneModule", back_populates="prompts")
    text_elements = relationship("TextElement", secondary="prompt_text_elements", back_populates="prompts")


class PromptTextElement(Base):
    """Many-to-Many zwischen Prompts und TextElements"""
    __tablename__ = "prompt_text_elements"
    
    prompt_id = Column(UUID(as_uuid=True), ForeignKey("prompts.id", ondelete="CASCADE"), primary_key=True)
    text_element_id = Column(UUID(as_uuid=True), ForeignKey("text_elements.id", ondelete="CASCADE"), primary_key=True)


class StoryVersion(Base):
    """Story Version Control"""
    __tablename__ = "story_versions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    story_id = Column(UUID(as_uuid=True), ForeignKey("stories.id", ondelete="CASCADE"), nullable=False)
    version_number = Column(Integer, nullable=False)
    global_assets_snapshot = Column(JSON)
    prompts_snapshot = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(String(255))
    
    # Relationships
    story = relationship("Story", back_populates="versions")


# ============================================================================
# DATABASE SETUP HELPER
# ============================================================================

def init_database(connection_string: str):
    """
    Initialisiert die Datenbank mit dem Schema.
    
    Args:
        connection_string: PostgreSQL Connection String
                          Z.B. "postgresql://user:password@localhost/zimage_turbo"
    """
    from sqlalchemy import create_engine
    
    engine = create_engine(connection_string)
    Base.metadata.create_all(engine)
    print("✅ Datenbank initialisiert!")


if __name__ == "__main__":
    print("Schema-Definition für Z-Image-Turbo Datenbank")
    print("=" * 80)
    print("\nSQL Schema:")
    print(SQL_SCHEMA)
