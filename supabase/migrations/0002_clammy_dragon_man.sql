-- Migration: Convert quests.name column to jsonb for multi-language support

ALTER TABLE "quests" 
  ALTER COLUMN "name" TYPE jsonb USING to_jsonb("name");
