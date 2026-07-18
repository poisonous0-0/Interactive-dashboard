import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appPath = path.resolve(__dirname, "..", "app.js");
const programPath = path.resolve(__dirname, "..", "framer.json");
const STORAGE_KEY = "framerSoloLevelingTracker_v1";

function createElement() {
	return {
		style: {},
		innerHTML: "",
		textContent: "",
		className: "",
		checked: false,
		disabled: false,
		addEventListener() {},
		appendChild() {},
		remove() {},
	};
}

test("an incomplete quest remains visible and locks the next program day after rollover", async () => {
	const [appSource, questProgram] = await Promise.all([
		readFile(appPath, "utf8"),
		readFile(programPath, "utf8").then(JSON.parse),
	]);
	const today = "2026-07-18";
	const yesterday = "2026-07-17";
	const dayOneQuests = questProgram[0].quests;
	const savedState = {
		version: 1,
		hunter: { level: 1, xp: 0, totalXpAllTime: 0, rank: "E", title: "The Weakest Hunter" },
		resources: { gold: 0, gems: 0, energy: 100, streak: 3, followers: {} },
		skills: {},
		today: {
			date: yesterday,
			programDay: 1,
			quests: {
				[dayOneQuests[0].id]: true,
				[dayOneQuests[1].id]: true,
				[dayOneQuests[2].id]: true,
				[dayOneQuests[3].id]: false,
			},
			weeklyQuest: false,
			weekKey: "2026-W29",
			notes: "",
			bonusGranted: false,
			lockedCarryOver: false,
			manualQuests: [{ id: "manual_1", label: "Optional follow-up", done: false }],
		},
		stats: {},
		achievements: {},
		claimedMilestones: [],
		logs: [],
		currentQuoteIndex: 0,
	};
	const elements = new Map();
	const document = {
		addEventListener(event, callback) {
			if (event === "DOMContentLoaded") this.onDOMContentLoaded = callback;
		},
		getElementById(id) {
			if (!elements.has(id)) elements.set(id, createElement());
			return elements.get(id);
		},
		createElement,
		querySelectorAll() {
			return [];
		},
	};
	const storage = new Map([[STORAGE_KEY, JSON.stringify(savedState)]]);
	class FixedDate extends Date {
		constructor(...args) {
			super(args.length ? args[0] : `${today}T12:00:00`);
		}
		static now() {
			return new Date(`${today}T12:00:00`).valueOf();
		}
	}
	const context = vm.createContext({
		document,
		Date: FixedDate,
		console,
		fetch: async () => ({ ok: true, json: async () => questProgram }),
		localStorage: {
			getItem: (key) => storage.get(key) ?? null,
			setItem: (key, value) => storage.set(key, value),
		},
		setTimeout: () => 0,
		Math,
		JSON,
		isFinite,
	});

	vm.runInContext(appSource, context, { filename: appPath });
	await document.onDOMContentLoaded();

	const rolledOverState = JSON.parse(storage.get(STORAGE_KEY));
	assert.equal(rolledOverState.today.date, today);
	assert.equal(rolledOverState.today.programDay, 1, "the next day must not unlock");
	assert.equal(rolledOverState.today.lockedCarryOver, true);
	assert.equal(rolledOverState.today.quests[dayOneQuests[3].id], false);
	assert.match(elements.get("questBoard").innerHTML, /Day 1 is pending/);
	assert.match(
		elements.get("questBoard").innerHTML,
		/data-manual-quest="manual_1"\s+disabled/,
		"optional quests should be disabled while a mandatory quest is incomplete",
	);
});
