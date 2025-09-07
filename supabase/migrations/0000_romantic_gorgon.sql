CREATE TABLE IF NOT EXISTS "hideout_levels" (
	"module_id" text NOT NULL,
	"level" integer NOT NULL,
	"other_requirements" jsonb,
	CONSTRAINT "hideout_levels_module_id_level_pk" PRIMARY KEY("module_id","level")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "hideout_modules" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"max_level" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "hideout_requirements" (
	"module_id" text NOT NULL,
	"level" integer NOT NULL,
	"item_id" text NOT NULL,
	"quantity" integer NOT NULL,
	CONSTRAINT "hideout_requirements_module_id_level_item_id_pk" PRIMARY KEY("module_id","level","item_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "items" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" text,
	"rarity" text,
	"value" integer,
	"weight_kg" numeric(10, 2),
	"image_url" text,
	"data" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quest_requirements" (
	"quest_id" text NOT NULL,
	"item_id" text NOT NULL,
	"quantity" integer NOT NULL,
	CONSTRAINT "quest_requirements_quest_id_item_id_pk" PRIMARY KEY("quest_id","item_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quest_rewards" (
	"quest_id" text NOT NULL,
	"item_id" text NOT NULL,
	"quantity" integer NOT NULL,
	CONSTRAINT "quest_rewards_quest_id_item_id_pk" PRIMARY KEY("quest_id","item_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quests" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"trader" text,
	"objectives" jsonb,
	"xp" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "skill_nodes" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text,
	"max_points" integer,
	"icon_url" text,
	"is_major" boolean DEFAULT false,
	"position" jsonb,
	"known_values" jsonb,
	"impacted_skill" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "skill_prerequisites" (
	"skill_id" text NOT NULL,
	"prerequisite_id" text NOT NULL,
	CONSTRAINT "skill_prerequisites_skill_id_prerequisite_id_pk" PRIMARY KEY("skill_id","prerequisite_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sync_metadata" (
	"id" text PRIMARY KEY NOT NULL,
	"synced_at" timestamp with time zone,
	"items_count" integer,
	"quests_count" integer,
	"skills_count" integer,
	"modules_count" integer
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "hideout_levels" ADD CONSTRAINT "hideout_levels_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "public"."hideout_modules"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "hideout_requirements" ADD CONSTRAINT "hideout_requirements_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "hideout_requirements" ADD CONSTRAINT "hideout_requirements_level_fkey" FOREIGN KEY ("module_id","level") REFERENCES "public"."hideout_levels"("module_id","level") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quest_requirements" ADD CONSTRAINT "quest_requirements_quest_id_fkey" FOREIGN KEY ("quest_id") REFERENCES "public"."quests"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quest_requirements" ADD CONSTRAINT "quest_requirements_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quest_rewards" ADD CONSTRAINT "quest_rewards_quest_id_fkey" FOREIGN KEY ("quest_id") REFERENCES "public"."quests"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quest_rewards" ADD CONSTRAINT "quest_rewards_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "skill_prerequisites" ADD CONSTRAINT "skill_prerequisites_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "public"."skill_nodes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "skill_prerequisites" ADD CONSTRAINT "skill_prerequisites_prerequisite_id_fkey" FOREIGN KEY ("prerequisite_id") REFERENCES "public"."skill_nodes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_items_type" ON "items" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_items_rarity" ON "items" USING btree ("rarity");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_quests_trader" ON "quests" USING btree ("trader");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_skills_category" ON "skill_nodes" USING btree ("category");