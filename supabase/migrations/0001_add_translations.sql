-- Migration: Convert text columns to jsonb for multi-language support
-- This migration converts name and description columns from text to jsonb
-- The USING clause wraps text values in JSON quotes to make them valid JSON strings

-- Drop the material_usage view first (it depends on items.name column)
DROP VIEW IF EXISTS "material_usage";

-- Update items table
-- Use to_jsonb() to properly convert text to jsonb
ALTER TABLE "items" 
  ALTER COLUMN "name" TYPE jsonb USING to_jsonb("name"),
  ALTER COLUMN "description" TYPE jsonb USING 
    CASE 
      WHEN "description" IS NULL THEN NULL 
      ELSE to_jsonb("description") 
    END;

-- Update skill_nodes table
ALTER TABLE "skill_nodes" 
  ALTER COLUMN "name" TYPE jsonb USING to_jsonb("name"),
  ALTER COLUMN "description" TYPE jsonb USING 
    CASE 
      WHEN "description" IS NULL THEN NULL 
      ELSE to_jsonb("description") 
    END;

-- Update hideout_modules table
ALTER TABLE "hideout_modules" 
  ALTER COLUMN "name" TYPE jsonb USING to_jsonb("name");

-- Recreate the material_usage view with the updated schema
CREATE VIEW "material_usage" AS 
SELECT 
  i.id, 
  i.name, 
  i.type, 
  COALESCE(qr.quest_required, 0::bigint) AS quest_required, 
  COALESCE(hr.hideout_required, 0::bigint) AS hideout_required, 
  COALESCE(qr.quest_required, 0::bigint) + COALESCE(hr.hideout_required, 0::bigint) AS total_required 
FROM items i 
LEFT JOIN (
  SELECT quest_requirements.item_id, sum(quest_requirements.quantity) AS quest_required 
  FROM quest_requirements 
  GROUP BY quest_requirements.item_id
) qr ON i.id = qr.item_id 
LEFT JOIN (
  SELECT hideout_requirements.item_id, sum(hideout_requirements.quantity) AS hideout_required 
  FROM hideout_requirements 
  GROUP BY hideout_requirements.item_id
) hr ON i.id = hr.item_id 
WHERE qr.quest_required > 0 OR hr.hideout_required > 0;
