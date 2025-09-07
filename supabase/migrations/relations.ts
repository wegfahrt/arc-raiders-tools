import { relations } from "drizzle-orm/relations";
import { skillNodes, skillPrerequisites, items, questRequirements, quests, questRewards, hideoutModules, hideoutLevels, hideoutRequirements } from "./schema";

export const skillPrerequisitesRelations = relations(skillPrerequisites, ({one}) => ({
	skillNode_prerequisiteId: one(skillNodes, {
		fields: [skillPrerequisites.prerequisiteId],
		references: [skillNodes.id],
		relationName: "skillPrerequisites_prerequisiteId_skillNodes_id"
	}),
	skillNode_skillId: one(skillNodes, {
		fields: [skillPrerequisites.skillId],
		references: [skillNodes.id],
		relationName: "skillPrerequisites_skillId_skillNodes_id"
	}),
}));

export const skillNodesRelations = relations(skillNodes, ({many}) => ({
	skillPrerequisites_prerequisiteId: many(skillPrerequisites, {
		relationName: "skillPrerequisites_prerequisiteId_skillNodes_id"
	}),
	skillPrerequisites_skillId: many(skillPrerequisites, {
		relationName: "skillPrerequisites_skillId_skillNodes_id"
	}),
}));

export const questRequirementsRelations = relations(questRequirements, ({one}) => ({
	item: one(items, {
		fields: [questRequirements.itemId],
		references: [items.id]
	}),
	quest: one(quests, {
		fields: [questRequirements.questId],
		references: [quests.id]
	}),
}));

export const itemsRelations = relations(items, ({many}) => ({
	questRequirements: many(questRequirements),
	questRewards: many(questRewards),
	hideoutRequirements: many(hideoutRequirements),
}));

export const questsRelations = relations(quests, ({many}) => ({
	questRequirements: many(questRequirements),
	questRewards: many(questRewards),
}));

export const questRewardsRelations = relations(questRewards, ({one}) => ({
	item: one(items, {
		fields: [questRewards.itemId],
		references: [items.id]
	}),
	quest: one(quests, {
		fields: [questRewards.questId],
		references: [quests.id]
	}),
}));

export const hideoutLevelsRelations = relations(hideoutLevels, ({one, many}) => ({
	hideoutModule: one(hideoutModules, {
		fields: [hideoutLevels.moduleId],
		references: [hideoutModules.id]
	}),
	hideoutRequirements: many(hideoutRequirements),
}));

export const hideoutModulesRelations = relations(hideoutModules, ({many}) => ({
	hideoutLevels: many(hideoutLevels),
}));

export const hideoutRequirementsRelations = relations(hideoutRequirements, ({one}) => ({
	item: one(items, {
		fields: [hideoutRequirements.itemId],
		references: [items.id]
	}),
	hideoutLevel: one(hideoutLevels, {
		fields: [hideoutRequirements.moduleId],
		references: [hideoutLevels.moduleId]
	}),
}));