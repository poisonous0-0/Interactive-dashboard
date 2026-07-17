import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const jsonPath = path.resolve(__dirname, "..", "framer.json");

async function loadQuestProgram() {
	const raw = await readFile(jsonPath, "utf8");
	return JSON.parse(raw);
}

test("framer.json has exactly 60 days", async () => {
	const program = await loadQuestProgram();
	assert.ok(Array.isArray(program), "framer.json should contain an array");
	assert.equal(program.length, 60, "Program must include exactly 60 days");
});

test("each day has exactly 4 quests with required fields", async () => {
	const program = await loadQuestProgram();

	for (const dayEntry of program) {
		assert.equal(
			typeof dayEntry.day,
			"number",
			"Each entry needs a numeric day",
		);
		assert.ok(Array.isArray(dayEntry.quests), "Each day needs a quests array");
		assert.equal(
			dayEntry.quests.length,
			4,
			`Day ${dayEntry.day} should have 4 quests`,
		);

		for (const quest of dayEntry.quests) {
			assert.equal(typeof quest.id, "string");
			assert.equal(typeof quest.label, "string");
			assert.equal(typeof quest.desc, "string");
			assert.equal(typeof quest.icon, "string");
			assert.equal(typeof quest.xp, "number");
			assert.equal(typeof quest.gold, "number");
			assert.equal(typeof quest.gems, "number");
			assert.equal(typeof quest.energy, "number");
		}
	}
});

test("quests change when day changes", async () => {
	const program = await loadQuestProgram();

	for (let i = 1; i < program.length; i += 1) {
		const prevIds = program[i - 1].quests.map((q) => q.id).join("|");
		const currentIds = program[i].quests.map((q) => q.id).join("|");

		assert.notEqual(
			currentIds,
			prevIds,
			`Day ${program[i].day} should not have identical quests to Day ${program[i - 1].day}`,
		);
	}
});
