import { pgTable, index, text, jsonb, integer, timestamp, numeric, boolean, foreignKey, primaryKey, pgView, bigint, serial } from "drizzle-orm/pg-core"
import { sql, relations } from "drizzle-orm"
import type { LocalizedText, MaterialRecipe, Effect } from '~/lib/types';



export const quests = pgTable("quests", {
	id: text().primaryKey().notNull(),
	name: jsonb().$type<LocalizedText>().notNull(),
	trader: text(),
	objectives: jsonb().$type<string[]>(),
	xp: integer(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_quests_trader").using("btree", table.trader.asc().nullsLast().op("text_ops")),
]);

export const items = pgTable("items", {
	id: text().primaryKey().notNull(),
	name: jsonb().$type<LocalizedText>().notNull(),
	description: jsonb().$type<LocalizedText>().notNull(),
	type: text().notNull(),
	rarity: text().notNull(),
	value: integer().notNull(),
	imageFilename: text("image_filename").notNull(),
	weightKg: numeric("weight_kg"),
	stackSize: integer("stack_size"),
	foundIn: text("found_in"),
	tip: text(),
	craftBench: text("craft_bench"),
	// Complex nested objects stored as JSONB
	recyclesInto: jsonb("recycles_into").$type<MaterialRecipe>(), // MaterialRecipe
	salvagesInto: jsonb("salvages_into").$type<MaterialRecipe>(), // MaterialRecipe
	recipe: jsonb().$type<MaterialRecipe>(), // MaterialRecipe
	effects: jsonb().$type<{ [effectName: string]: Effect }>(), // { [effectName: string]: Effect }
	// Metadata
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("idx_items_rarity").using("btree", table.rarity.asc().nullsLast().op("text_ops")),
	index("idx_items_type").using("btree", table.type.asc().nullsLast().op("text_ops")),
	index("idx_items_craft_bench").using("btree", table.craftBench.asc().nullsLast().op("text_ops")),
]);

export const skillNodes = pgTable("skill_nodes", {
	id: text().primaryKey().notNull(),
	name: jsonb().$type<LocalizedText>().notNull(),
	description: jsonb().$type<LocalizedText>(),
	category: text(),
	maxPoints: integer("max_points"),
	iconUrl: text("icon_url"),
	isMajor: boolean("is_major").default(false),
	position: jsonb().$type<{ x: number; y: number }>(),
	knownValues: jsonb("known_values").$type<any[]>(),
	impactedSkill: text("impacted_skill"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_skills_category").using("btree", table.category.asc().nullsLast().op("text_ops")),
]);

export const hideoutModules = pgTable("hideout_modules", {
	id: text().primaryKey().notNull(),
	name: jsonb().$type<LocalizedText>().notNull(),
	maxLevel: integer("max_level").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const projects = pgTable("projects", {
	id: text().primaryKey().notNull(),
	name: jsonb().$type<LocalizedText>().notNull(),
	description: jsonb().$type<LocalizedText>().notNull(),
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
	projectsCount: integer("projects_count"),
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
	otherRequirements: jsonb("other_requirements").$type<string[]>(),
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

export const projectPhases = pgTable("project_phases", {
	id: serial().primaryKey().notNull(),
	projectId: text("project_id").notNull(),
	phase: integer().notNull(),
	name: jsonb().$type<LocalizedText>().notNull(),
	description: jsonb().$type<LocalizedText>(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "project_phases_project_id_fkey"
		}).onDelete("cascade"),
	index("idx_project_phases_project_id").using("btree", table.projectId.asc().nullsLast().op("text_ops")),
	primaryKey({ columns: [table.projectId, table.phase], name: "project_phases_project_id_phase_key"}),
]);

export const phaseItemRequirements = pgTable("phase_item_requirements", {
	id: serial().primaryKey().notNull(),
	projectId: text("project_id").notNull(),
	phase: integer().notNull(),
	itemId: text("item_id").notNull(),
	quantity: integer().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.itemId],
			foreignColumns: [items.id],
			name: "phase_item_requirements_item_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "phase_item_requirements_project_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.projectId, table.phase],
			foreignColumns: [projectPhases.projectId, projectPhases.phase],
			name: "phase_item_requirements_project_id_phase_fkey"
		}).onDelete("cascade"),
	index("idx_phase_item_requirements_project_phase").using("btree", table.projectId.asc().nullsLast().op("text_ops"), table.phase.asc().nullsLast().op("int4_ops")),
	index("idx_phase_item_requirements_item_id").using("btree", table.itemId.asc().nullsLast().op("text_ops")),
	primaryKey({ columns: [table.projectId, table.phase, table.itemId], name: "phase_item_requirements_project_id_phase_item_id_key"}),
]);

export const phaseCategoryRequirements = pgTable("phase_category_requirements", {
	id: serial().primaryKey().notNull(),
	projectId: text("project_id").notNull(),
	phase: integer().notNull(),
	category: text().notNull(),
	valueRequired: integer("value_required").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "phase_category_requirements_project_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.projectId, table.phase],
			foreignColumns: [projectPhases.projectId, projectPhases.phase],
			name: "phase_category_requirements_project_id_phase_fkey"
		}).onDelete("cascade"),
	index("idx_phase_category_requirements_project_phase").using("btree", table.projectId.asc().nullsLast().op("text_ops"), table.phase.asc().nullsLast().op("int4_ops")),
	primaryKey({ columns: [table.projectId, table.phase, table.category], name: "phase_category_requirements_project_id_phase_category_key"}),
]);

export const materialUsage = pgView("material_usage", {
	id: text(),
	name: jsonb().$type<LocalizedText>(),
	type: text(),
	questRequired: bigint("quest_required", { mode: "number" }),
	hideoutRequired: bigint("hideout_required", { mode: "number" }),
	projectRequired: bigint("project_required", { mode: "number" }),
	totalRequired: bigint("total_required", { mode: "number" }),
}).as(sql`SELECT i.id, i.name, i.type, COALESCE(qr.quest_required, 0::bigint) AS quest_required, COALESCE(hr.hideout_required, 0::bigint) AS hideout_required, COALESCE(pr.project_required, 0::bigint) AS project_required, COALESCE(qr.quest_required, 0::bigint) + COALESCE(hr.hideout_required, 0::bigint) + COALESCE(pr.project_required, 0::bigint) AS total_required FROM items i LEFT JOIN ( SELECT quest_requirements.item_id, sum(quest_requirements.quantity) AS quest_required FROM quest_requirements GROUP BY quest_requirements.item_id) qr ON i.id = qr.item_id LEFT JOIN ( SELECT hideout_requirements.item_id, sum(hideout_requirements.quantity) AS hideout_required FROM hideout_requirements GROUP BY hideout_requirements.item_id) hr ON i.id = hr.item_id LEFT JOIN ( SELECT phase_item_requirements.item_id, sum(phase_item_requirements.quantity) AS project_required FROM phase_item_requirements GROUP BY phase_item_requirements.item_id) pr ON i.id = pr.item_id WHERE qr.quest_required > 0 OR hr.hideout_required > 0 OR pr.project_required > 0`);

// Define relations
export const questsRelations = relations(quests, ({ many }) => ({
  requirements: many(questRequirements),
  rewards: many(questRewards),
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

export const questRewardsRelations = relations(questRewards, ({ one }) => ({
  quest: one(quests, {
    fields: [questRewards.questId],
    references: [quests.id],
  }),
  item: one(items, {
    fields: [questRewards.itemId],
    references: [items.id],
  }),
}));

export const itemsRelations = relations(items, ({ many }) => ({
  questRequirements: many(questRequirements),
  questRewards: many(questRewards),
  hideoutRequirements: many(hideoutRequirements),
  phaseItemRequirements: many(phaseItemRequirements),
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

export const projectsRelations = relations(projects, ({ many }) => ({
  phases: many(projectPhases),
}));

export const projectPhasesRelations = relations(projectPhases, ({ one, many }) => ({
  project: one(projects, {
    fields: [projectPhases.projectId],
    references: [projects.id],
  }),
  itemRequirements: many(phaseItemRequirements),
  categoryRequirements: many(phaseCategoryRequirements),
}));

export const phaseItemRequirementsRelations = relations(phaseItemRequirements, ({ one }) => ({
  phase: one(projectPhases, {
    fields: [phaseItemRequirements.projectId, phaseItemRequirements.phase],
    references: [projectPhases.projectId, projectPhases.phase],
  }),
  item: one(items, {
    fields: [phaseItemRequirements.itemId],
    references: [items.id],
  }),
  project: one(projects, {
    fields: [phaseItemRequirements.projectId],
    references: [projects.id],
  }),
}));

export const phaseCategoryRequirementsRelations = relations(phaseCategoryRequirements, ({ one }) => ({
  phase: one(projectPhases, {
    fields: [phaseCategoryRequirements.projectId, phaseCategoryRequirements.phase],
    references: [projectPhases.projectId, projectPhases.phase],
  }),
  project: one(projects, {
    fields: [phaseCategoryRequirements.projectId],
    references: [projects.id],
  }),
}));

export const skillNodesRelations = relations(skillNodes, ({ many }) => ({
  prerequisites: many(skillPrerequisites, {
    relationName: "skill_to_prerequisites"
  }),
  dependents: many(skillPrerequisites, {
    relationName: "prerequisite_to_skills"
  }),
}));

export const skillPrerequisitesRelations = relations(skillPrerequisites, ({ one }) => ({
  skill: one(skillNodes, {
    fields: [skillPrerequisites.skillId],
    references: [skillNodes.id],
    relationName: "skill_to_prerequisites"
  }),
  prerequisite: one(skillNodes, {
    fields: [skillPrerequisites.prerequisiteId],
    references: [skillNodes.id],
    relationName: "prerequisite_to_skills"
  }),
}));
