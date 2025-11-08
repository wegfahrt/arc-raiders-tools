import { pgTable, index, text, jsonb, integer, timestamp, numeric, boolean, foreignKey, primaryKey, pgView, bigint } from "drizzle-orm/pg-core"
import { sql, relations } from "drizzle-orm"



export const quests = pgTable("quests", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	trader: text(),
	objectives: jsonb(),
	xp: integer(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_quests_trader").using("btree", table.trader.asc().nullsLast().op("text_ops")),
]);

export const items = pgTable("items", {
	id: text().primaryKey().notNull(),
	name: jsonb().notNull(),
	description: jsonb(),
	type: text(),
	rarity: text(),
	value: integer(),
	weightKg: numeric("weight_kg"),
	imageUrl: text("image_url"),
	data: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_items_rarity").using("btree", table.rarity.asc().nullsLast().op("text_ops")),
	index("idx_items_type").using("btree", table.type.asc().nullsLast().op("text_ops")),
]);

export const skillNodes = pgTable("skill_nodes", {
	id: text().primaryKey().notNull(),
	name: jsonb().notNull(),
	description: jsonb(),
	category: text(),
	maxPoints: integer("max_points"),
	iconUrl: text("icon_url"),
	isMajor: boolean("is_major").default(false),
	position: jsonb(),
	knownValues: jsonb("known_values"),
	impactedSkill: text("impacted_skill"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_skills_category").using("btree", table.category.asc().nullsLast().op("text_ops")),
]);

export const hideoutModules = pgTable("hideout_modules", {
	id: text().primaryKey().notNull(),
	name: jsonb().notNull(),
	maxLevel: integer("max_level"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const syncMetadata = pgTable("sync_metadata", {
	id: text().primaryKey().notNull(),
	syncedAt: timestamp("synced_at", { withTimezone: true, mode: 'string' }),
	itemsCount: integer("items_count"),
	questsCount: integer("quests_count"),
	skillsCount: integer("skills_count"),
	modulesCount: integer("modules_count"),
});

export const skillPrerequisites = pgTable("skill_prerequisites", {
	skillId: text("skill_id").notNull(),
	prerequisiteId: text("prerequisite_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.prerequisiteId],
			foreignColumns: [skillNodes.id],
			name: "skill_prerequisites_prerequisite_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.skillId],
			foreignColumns: [skillNodes.id],
			name: "skill_prerequisites_skill_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.skillId, table.prerequisiteId], name: "skill_prerequisites_pkey"}),
]);

export const questRequirements = pgTable("quest_requirements", {
	questId: text("quest_id").notNull(),
	itemId: text("item_id").notNull(),
	quantity: integer().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.itemId],
			foreignColumns: [items.id],
			name: "quest_requirements_item_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.questId],
			foreignColumns: [quests.id],
			name: "quest_requirements_quest_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.questId, table.itemId], name: "quest_requirements_pkey"}),
]);

export const questRewards = pgTable("quest_rewards", {
	questId: text("quest_id").notNull(),
	itemId: text("item_id").notNull(),
	quantity: integer().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.itemId],
			foreignColumns: [items.id],
			name: "quest_rewards_item_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.questId],
			foreignColumns: [quests.id],
			name: "quest_rewards_quest_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.questId, table.itemId], name: "quest_rewards_pkey"}),
]);

export const hideoutLevels = pgTable("hideout_levels", {
	moduleId: text("module_id").notNull(),
	level: integer().notNull(),
	otherRequirements: jsonb("other_requirements"),
}, (table) => [
	foreignKey({
			columns: [table.moduleId],
			foreignColumns: [hideoutModules.id],
			name: "hideout_levels_module_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.moduleId, table.level], name: "hideout_levels_pkey"}),
]);

export const hideoutRequirements = pgTable("hideout_requirements", {
	moduleId: text("module_id").notNull(),
	level: integer().notNull(),
	itemId: text("item_id").notNull(),
	quantity: integer().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.itemId],
			foreignColumns: [items.id],
			name: "hideout_requirements_item_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.moduleId, table.level],
			foreignColumns: [hideoutLevels.moduleId, hideoutLevels.level],
			name: "hideout_requirements_module_id_level_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.moduleId, table.level, table.itemId], name: "hideout_requirements_pkey"}),
]);
export const materialUsage = pgView("material_usage", {	id: text(),
	name: jsonb(),
	type: text(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	questRequired: bigint("quest_required", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	hideoutRequired: bigint("hideout_required", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	totalRequired: bigint("total_required", { mode: "number" }),
}).as(sql`SELECT i.id, i.name, i.type, COALESCE(qr.quest_required, 0::bigint) AS quest_required, COALESCE(hr.hideout_required, 0::bigint) AS hideout_required, COALESCE(qr.quest_required, 0::bigint) + COALESCE(hr.hideout_required, 0::bigint) AS total_required FROM items i LEFT JOIN ( SELECT quest_requirements.item_id, sum(quest_requirements.quantity) AS quest_required FROM quest_requirements GROUP BY quest_requirements.item_id) qr ON i.id = qr.item_id LEFT JOIN ( SELECT hideout_requirements.item_id, sum(hideout_requirements.quantity) AS hideout_required FROM hideout_requirements GROUP BY hideout_requirements.item_id) hr ON i.id = hr.item_id WHERE qr.quest_required > 0 OR hr.hideout_required > 0`);

// Define relations
export const questsRelations = relations(quests, ({ many }) => ({
  requirements: many(questRequirements),
}));

export const questRequirementsRelations = relations(questRequirements, ({ one }) => ({
  quest: one(quests, {
    fields: [questRequirements.questId],
    references: [quests.id],
  }),
  item: one(items, {
    fields: [questRequirements.itemId],
    references: [items.id],
  }),
}));

export const itemsRelations = relations(items, ({ many }) => ({
  questRequirements: many(questRequirements),
}));

export const hideoutModulesRelations = relations(hideoutModules, ({ many }) => ({
	levels: many(hideoutLevels),
}));

export const hideoutLevelsRelations = relations(hideoutLevels, ({ one, many }) => ({
  module: one(hideoutModules, {
    fields: [hideoutLevels.moduleId],
    references: [hideoutModules.id],
  }),
  requirements: many(hideoutRequirements),
}));

export const hideoutRequirementsRelations = relations(hideoutRequirements, ({ one }) => ({
  level: one(hideoutLevels, {
    fields: [hideoutRequirements.moduleId, hideoutRequirements.level],
    references: [hideoutLevels.moduleId, hideoutLevels.level],
  }),
  item: one(items, {
    fields: [hideoutRequirements.itemId],
    references: [items.id],
  }),
}));
