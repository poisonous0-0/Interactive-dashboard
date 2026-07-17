(function () {
	"use strict";

	/* ============================================================
   CONSTANTS / DEFINITIONS
   ============================================================ */
	const STORAGE_KEY = "framerSoloLevelingTracker_v1";

	const FALLBACK_QUEST_DEFS = [
		{
			id: "fallback_quest_1",
			label: "Learn Something New",
			desc: "Study a tutorial, article, or course",
			xp: 10,
			gold: 5,
			gems: 0,
			energy: 5,
			icon: "fa-book-open",
		},
		{
			id: "fallback_quest_2",
			label: "Build for 60+ Minutes",
			desc: "Deep work inside the Framer canvas",
			xp: 40,
			gold: 15,
			gems: 0,
			energy: 20,
			icon: "fa-hammer",
		},
		{
			id: "fallback_quest_3",
			label: "Post on Social Media",
			desc: "Ship content to the outside world",
			xp: 15,
			gold: 5,
			gems: 1,
			energy: 10,
			icon: "fa-share-nodes",
		},
		{
			id: "fallback_quest_4",
			label: "Study Another Creator",
			desc: "Break down someone else's craft",
			xp: 10,
			gold: 5,
			gems: 0,
			energy: 5,
			icon: "fa-magnifying-glass",
		},
	];
	const PROGRAM_DAYS_TOTAL = 60;
	const QUESTS_PER_DAY = 4;
	const WEEKLY_QUEST = { xp: 25, gold: 10, energy: 10 };
	const PERFECT_DAY_BONUS = { gold: 50, gems: 5 };

	const SKILL_DEFS = [
		{ id: "framer", label: "Framer Skills", icon: "fa-diagram-project" },
		{ id: "design", label: "Design", icon: "fa-palette" },
		{ id: "motion", label: "Motion", icon: "fa-film" },
		{ id: "content", label: "Content Creation", icon: "fa-pen-nib" },
		{ id: "marketing", label: "Marketing", icon: "fa-bullhorn" },
		{ id: "sales", label: "Sales", icon: "fa-handshake" },
		{ id: "templates", label: "Templates", icon: "fa-layer-group" },
	];

	const TIERS = [
		{ minLevel: 1, rank: "E", title: "The Weakest Hunter" },
		{ minLevel: 5, rank: "E", title: "Awakened Novice" },
		{ minLevel: 10, rank: "D", title: "Rising Hunter" },
		{ minLevel: 15, rank: "D", title: "Steel Will Hunter" },
		{ minLevel: 20, rank: "C", title: "Shadow Apprentice" },
		{ minLevel: 25, rank: "C", title: "Blade Adept" },
		{ minLevel: 30, rank: "B", title: "Elite Hunter" },
		{ minLevel: 35, rank: "B", title: "Battle Master" },
		{ minLevel: 40, rank: "A", title: "Monarch's Disciple" },
		{ minLevel: 45, rank: "A", title: "Shadow Sovereign" },
		{ minLevel: 50, rank: "S", title: "Shadow Monarch" },
	];
	const RANK_COLOR = {
		E: "var(--r-e)",
		D: "var(--r-d)",
		C: "var(--r-c)",
		B: "var(--r-b)",
		A: "var(--r-a)",
		S: "var(--r-s)",
	};
	const NEXT_RANK_LEVEL = { E: 10, D: 20, C: 30, B: 40, A: 50, S: null };
	const NEXT_RANK_NAME = {
		E: "D",
		D: "C",
		C: "B",
		B: "A",
		A: "S",
		S: null,
	};

	const MILESTONES = [
		{ level: 5, label: "+100 Bonus Gold", gold: 100 },
		{ level: 10, label: "D-Rank Promotion" },
		{ level: 15, label: "+50 Bonus Gems", gems: 50 },
		{ level: 20, label: "C-Rank Promotion" },
		{ level: 25, label: "Exclusive Hunter Badge" },
		{ level: 30, label: "B-Rank Promotion" },
		{ level: 40, label: "A-Rank Promotion" },
		{ level: 50, label: "S-Rank: Shadow Monarch" },
	];

	const ACHIEVEMENT_DEFS = [
		{
			id: "firstSteps",
			label: "First Steps",
			icon: "fa-shoe-prints",
			test: (s) => s.stats.totalQuestsCompleted >= 1,
		},
		{
			id: "perfectDay",
			label: "Perfect Day",
			icon: "fa-star",
			test: (s) => s.stats.perfectDays >= 1,
		},
		{
			id: "streak7",
			label: "7-Day Streak",
			icon: "fa-fire",
			test: (s) => s.stats.bestStreak >= 7,
		},
		{
			id: "streak30",
			label: "30-Day Streak",
			icon: "fa-fire-flame-curved",
			test: (s) => s.stats.bestStreak >= 30,
		},
		{
			id: "level5",
			label: "Level 5 Reached",
			icon: "fa-angles-up",
			test: (s) => s.hunter.level >= 5,
		},
		{
			id: "level10",
			label: "D-Rank Attained",
			icon: "fa-shield",
			test: (s) => s.hunter.level >= 10,
		},
		{
			id: "level20",
			label: "C-Rank Attained",
			icon: "fa-shield-halved",
			test: (s) => s.hunter.level >= 20,
		},
		{
			id: "level30",
			label: "B-Rank Attained",
			icon: "fa-shield-heart",
			test: (s) => s.hunter.level >= 30,
		},
		{
			id: "level50",
			label: "S-Rank: Monarch",
			icon: "fa-crown",
			test: (s) => s.hunter.level >= 50,
		},
		{
			id: "goldHoarder",
			label: "Gold Hoarder",
			icon: "fa-sack-dollar",
			test: (s) => s.resources.gold >= 500,
		},
		{
			id: "socialButterfly",
			label: "Social Butterfly",
			icon: "fa-hashtag",
			test: (s) => s.stats.totalPosts >= 10,
		},
		{
			id: "centuryClub",
			label: "Century Club",
			icon: "fa-medal",
			test: (s) => s.hunter.totalXpAllTime >= 1000,
		},
	];

	const QUOTES = [
		"Power is not given. It is forged through relentless repetition.",
		"Every rank was once a beginning. Keep climbing.",
		"The weak today can become the strongest tomorrow \u2014 if they never stop leveling up.",
		"Discipline is the dungeon you must clear every single day.",
		"There are no shortcuts to the top floor. Only the next quest.",
		"A true hunter tracks progress, not excuses.",
		"Your only rival is the version of you from yesterday.",
		"Grind in silence. Let your rank speak for you.",
		"Small quests, completed daily, are how legends are actually built.",
		"Arise, and become stronger than the hunter you were this morning.",
	];

	/* ============================================================
   STATE
   ============================================================ */
	let state = null;
	let questProgram = [];
	let questDefsForToday = FALLBACK_QUEST_DEFS.slice(0, QUESTS_PER_DAY);

	function pad2(n) {
		return String(n).padStart(2, "0");
	}

	function todayStr(d) {
		d = d || new Date();
		return (
			d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate())
		);
	}

	function getWeekKey(date) {
		const d = new Date(
			Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
		);
		const dayNum = d.getUTCDay() || 7;
		d.setUTCDate(d.getUTCDate() + 4 - dayNum);
		const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
		const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
		return d.getUTCFullYear() + "-W" + weekNo;
	}

	function clamp(v, lo, hi) {
		return Math.max(lo, Math.min(hi, v));
	}

	function escapeHtml(str) {
		return String(str == null ? "" : str)
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#39;");
	}

	function normalizeQuestDef(raw, fallbackId) {
		return {
			id: String(raw && raw.id ? raw.id : fallbackId),
			label: String(raw && raw.label ? raw.label : "Untitled Quest"),
			desc: String(raw && raw.desc ? raw.desc : ""),
			xp: Math.max(0, parseInt(raw && raw.xp, 10) || 0),
			gold: Math.max(0, parseInt(raw && raw.gold, 10) || 0),
			gems: Math.max(0, parseInt(raw && raw.gems, 10) || 0),
			energy: Math.max(0, parseInt(raw && raw.energy, 10) || 0),
			icon:
				typeof raw === "object" && raw && raw.icon
					? String(raw.icon)
					: "fa-list-check",
		};
	}

	function getTotalProgramDays() {
		return questProgram.length || PROGRAM_DAYS_TOTAL;
	}

	function getQuestDefsForDay(programDay) {
		const dayIndex = clamp(
			programDay - 1,
			0,
			Math.max(0, questProgram.length - 1),
		);
		const dayData = questProgram[dayIndex];
		if (!dayData || !Array.isArray(dayData.quests)) {
			return FALLBACK_QUEST_DEFS.slice(0, QUESTS_PER_DAY);
		}
		return dayData.quests.slice(0, QUESTS_PER_DAY);
	}

	function buildQuestStateForDefs(defs, existing) {
		const next = {};
		defs.forEach((def) => {
			next[def.id] = !!(existing && existing[def.id]);
		});
		return next;
	}

	function syncQuestDefsForToday() {
		if (
			typeof state.today.programDay !== "number" ||
			!isFinite(state.today.programDay)
		) {
			state.today.programDay = (state.logs ? state.logs.length : 0) + 1;
		}
		const day = clamp(state.today.programDay || 1, 1, getTotalProgramDays());
		state.today.programDay = day;
		questDefsForToday = getQuestDefsForDay(day);
		state.today.quests = buildQuestStateForDefs(
			questDefsForToday,
			state.today.quests,
		);
	}

	function defaultState() {
		const now = new Date();
		return {
			version: 1,
			hunter: {
				level: 1,
				xp: 0,
				totalXpAllTime: 0,
				rank: "E",
				title: "The Weakest Hunter",
			},
			resources: {
				gold: 0,
				gems: 0,
				energy: 100,
				streak: 0,
				followers: { x: 0, linkedin: 0, instagram: 0, framer: 0 },
			},
			skills: {
				framer: 0,
				design: 0,
				motion: 0,
				content: 0,
				marketing: 0,
				sales: 0,
				templates: 0,
			},
			today: {
				date: todayStr(now),
				programDay: 1,
				quests: buildQuestStateForDefs(getQuestDefsForDay(1)),
				weeklyQuest: false,
				weekKey: getWeekKey(now),
				notes: "",
				bonusGranted: false,
			},
			stats: {
				totalQuestsCompleted: 0,
				totalBuilds: 0,
				totalPosts: 0,
				totalLearns: 0,
				totalStudies: 0,
				totalNotesUpdates: 0,
				perfectDays: 0,
				bestStreak: 0,
			},
			achievements: {},
			claimedMilestones: [],
			logs: [],
			currentQuoteIndex: 0,
		};
	}

	function loadState() {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (raw) {
				const parsed = JSON.parse(raw);
				const merged = defaultState();
				// shallow+nested merge so new fields introduced later always exist
				merged.hunter = Object.assign(merged.hunter, parsed.hunter);
				merged.resources = Object.assign(merged.resources, parsed.resources);
				if (parsed.resources && parsed.resources.followers)
					merged.resources.followers = Object.assign(
						merged.resources.followers,
						parsed.resources.followers,
					);
				merged.skills = Object.assign(merged.skills, parsed.skills);
				merged.today = Object.assign(merged.today, parsed.today);
				if (parsed.today && parsed.today.quests) {
					merged.today.quests = Object.assign(
						merged.today.quests,
						parsed.today.quests,
					);
				}
				if (
					typeof merged.today.programDay !== "number" ||
					!isFinite(merged.today.programDay)
				) {
					merged.today.programDay = 1;
				}
				merged.stats = Object.assign(merged.stats, parsed.stats);
				merged.achievements = Object.assign(
					merged.achievements,
					parsed.achievements,
				);
				merged.claimedMilestones = parsed.claimedMilestones || [];
				merged.logs = (parsed.logs || []).map((entry) => {
					if (Array.isArray(entry.questChecks)) return entry;
					return Object.assign({}, entry, {
						programDay:
							typeof entry.programDay === "number" ? entry.programDay : null,
						questChecks: [
							!!entry.build,
							!!entry.learn,
							!!entry.post,
							!!entry.study,
						],
					});
				});
				merged.currentQuoteIndex =
					typeof parsed.currentQuoteIndex === "number"
						? parsed.currentQuoteIndex
						: 0;
				return merged;
			}
		} catch (e) {
			/* corrupted storage, fall back to defaults */
		}
		return defaultState();
	}

	function saveState() {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
		} catch (e) {
			/* storage unavailable or full - fail silently */
		}
	}

	/* ============================================================
   TOASTS
   ============================================================ */
	function showToast(message, type) {
		const container = document.getElementById("toastContainer");
		const el = document.createElement("div");
		el.className = "toast" + (type ? " " + type : "");
		el.textContent = message;
		container.appendChild(el);
		setTimeout(() => {
			el.remove();
		}, 4200);
	}

	/* ============================================================
   CORE LEVEL / RANK ENGINE
   ============================================================ */
	function getTierForLevel(level) {
		let tier = TIERS[0];
		for (const t of TIERS) {
			if (level >= t.minLevel) tier = t;
			else break;
		}
		return tier;
	}

	function updateRankAndTitle() {
		const h = state.hunter;
		const tier = getTierForLevel(h.level);
		const rankChanged = tier.rank !== h.rank;
		h.rank = tier.rank;
		h.title = tier.title;
		if (rankChanged) {
			showToast(
				"\u{1F53A} RANK UP! Welcome to " + tier.rank + "-RANK",
				"rankup",
			);
		}
	}

	function checkMilestones() {
		MILESTONES.forEach((m) => {
			if (
				state.hunter.level >= m.level &&
				state.claimedMilestones.indexOf(m.level) === -1
			) {
				state.claimedMilestones.push(m.level);
				if (m.gold) state.resources.gold += m.gold;
				if (m.gems) state.resources.gems += m.gems;
				showToast("\u{1F381} Milestone Unlocked: " + m.label, "milestone");
			}
		});
	}

	function addXP(amount) {
		const h = state.hunter;
		h.totalXpAllTime = Math.max(0, h.totalXpAllTime + amount);
		const prevLevel = h.level;
		h.xp += amount;
		while (h.xp >= 100) {
			h.xp -= 100;
			h.level += 1;
		}
		while (h.xp < 0) {
			if (h.level > 1) {
				h.level -= 1;
				h.xp += 100;
			} else {
				h.xp = 0;
				break;
			}
		}
		if (h.level !== prevLevel) {
			updateRankAndTitle();
			if (h.level > prevLevel) {
				showToast("\u26A1 LEVEL UP! You are now Level " + h.level, "levelup");
			}
			checkMilestones();
		}
	}

	function computeAchievements() {
		ACHIEVEMENT_DEFS.forEach((def) => {
			if (!state.achievements[def.id] && def.test(state)) {
				state.achievements[def.id] = true;
				showToast(
					"\u{1F3C6} Achievement Unlocked: " + def.label + "!",
					"achievement",
				);
			}
		});
	}

	/* ============================================================
   DAY ROLLOVER
   ============================================================ */
	function finalizeDay(day) {
		const dayProgram = clamp(day.programDay || 1, 1, getTotalProgramDays());
		const dayQuestDefs = getQuestDefsForDay(dayProgram);
		let xpEarned = 0;
		dayQuestDefs.forEach((q) => {
			if (day.quests[q.id]) xpEarned += q.xp;
		});
		if (day.weeklyQuest) xpEarned += WEEKLY_QUEST.xp;

		const allDone = dayQuestDefs.every((q) => day.quests[q.id]);
		if (allDone) {
			state.resources.streak += 1;
		} else {
			state.resources.streak = 0;
		}
		state.stats.bestStreak = Math.max(
			state.stats.bestStreak,
			state.resources.streak,
		);

		const entry = {
			date: day.date,
			dayName: new Date(day.date + "T00:00:00").toLocaleDateString("en-US", {
				weekday: "short",
			}),
			programDay: dayProgram,
			questChecks: dayQuestDefs.map((q) => !!day.quests[q.id]),
			weeklyQuest: !!day.weeklyQuest,
			xpEarned: xpEarned,
			totalXp: state.hunter.totalXpAllTime,
			level: state.hunter.level,
			notes: day.notes || "",
		};
		state.logs.unshift(entry);
		computeAchievements();
	}

	function checkRollover() {
		const current = todayStr();
		if (state.today.date !== current) {
			finalizeDay(state.today);
			const prevWeekKey = state.today.weekKey;
			const newWeekKey = getWeekKey(new Date());
			const nextProgramDay = clamp(
				(state.today.programDay || 1) + 1,
				1,
				getTotalProgramDays(),
			);
			state.today = {
				date: current,
				programDay: nextProgramDay,
				quests: buildQuestStateForDefs(getQuestDefsForDay(nextProgramDay)),
				weeklyQuest:
					newWeekKey === prevWeekKey ? state.today.weeklyQuest : false,
				weekKey: newWeekKey,
				notes: "",
				bonusGranted: false,
			};
			state.resources.energy = 100;
			saveState();
		}
	}

	/* ============================================================
   QUEST INTERACTIONS
   ============================================================ */
	function checkPerfectDayBonus() {
		const allDone = questDefsForToday.every((q) => state.today.quests[q.id]);
		if (allDone && !state.today.bonusGranted) {
			state.today.bonusGranted = true;
			state.resources.gold += PERFECT_DAY_BONUS.gold;
			state.resources.gems += PERFECT_DAY_BONUS.gems;
			state.stats.perfectDays += 1;
			showToast(
				"\u{1F31F} PERFECT DAY! Bonus +" +
					PERFECT_DAY_BONUS.gold +
					" Gold, +" +
					PERFECT_DAY_BONUS.gems +
					" Gems",
				"achievement",
			);
		} else if (!allDone && state.today.bonusGranted) {
			state.today.bonusGranted = false;
			state.resources.gold = Math.max(
				0,
				state.resources.gold - PERFECT_DAY_BONUS.gold,
			);
			state.resources.gems = Math.max(
				0,
				state.resources.gems - PERFECT_DAY_BONUS.gems,
			);
			state.stats.perfectDays = Math.max(0, state.stats.perfectDays - 1);
		}
	}

	function getStatKeyForQuest(def) {
		const text = (def.label + " " + def.desc).toLowerCase();
		if (text.indexOf("post") !== -1) return "totalPosts";
		if (text.indexOf("build") !== -1 || text.indexOf("ship") !== -1)
			return "totalBuilds";
		if (
			text.indexOf("study") !== -1 ||
			text.indexOf("learn") !== -1 ||
			text.indexOf("tutorial") !== -1
		)
			return "totalLearns";
		if (text.indexOf("note") !== -1 || text.indexOf("log") !== -1)
			return "totalNotesUpdates";
		return null;
	}

	function setQuestState(id, checked) {
		const def = questDefsForToday.find((q) => q.id === id);
		if (!def) return;
		if (state.today.quests[id] === checked) return;

		state.today.quests[id] = checked;
		const sign = checked ? 1 : -1;

		addXP(sign * def.xp);
		state.resources.gold = Math.max(0, state.resources.gold + sign * def.gold);
		if (def.gems)
			state.resources.gems = Math.max(
				0,
				state.resources.gems + sign * def.gems,
			);
		state.resources.energy = clamp(
			state.resources.energy - sign * def.energy,
			0,
			100,
		);

		if (checked) {
			state.stats.totalQuestsCompleted += 1;
			const statKey = getStatKeyForQuest(def);
			if (statKey && typeof state.stats[statKey] === "number") {
				state.stats[statKey] += 1;
			}
		}

		checkPerfectDayBonus();
		computeAchievements();
		saveState();
		renderAll();
	}

	function setWeeklyQuest(checked) {
		if (state.today.weeklyQuest === checked) return;
		state.today.weeklyQuest = checked;
		const sign = checked ? 1 : -1;
		addXP(sign * WEEKLY_QUEST.xp);
		state.resources.gold = Math.max(
			0,
			state.resources.gold + sign * WEEKLY_QUEST.gold,
		);
		state.resources.energy = clamp(
			state.resources.energy - sign * WEEKLY_QUEST.energy,
			0,
			100,
		);
		saveState();
		renderAll();
	}

	function adjustSkill(id, delta) {
		if (!(id in state.skills)) return;
		state.skills[id] = clamp(state.skills[id] + delta, 0, 100);
		saveState();
		renderSkills();
	}

	/* ============================================================
   RENDER: HUNTER STATUS
   ============================================================ */
	function renderHunterStatus() {
		const h = state.hunter;
		const rankColor = RANK_COLOR[h.rank] || RANK_COLOR.E;
		const nextLevel = NEXT_RANK_LEVEL[h.rank];
		const nextName = NEXT_RANK_NAME[h.rank];
		const nextRankHtml = nextLevel
			? "Next Rank: <b>" + nextName + "-RANK</b> at Lv." + nextLevel
			: "<b>Max Rank Achieved</b>";

		document.getElementById("hunterStatusPanel").innerHTML =
			'<div class="card-title"><i class="fa-solid fa-chart-line"></i> Hunter Status</div>' +
			'<div class="status-top">' +
			'<div class="status-chip rank">' +
			'<span class="label">Rank</span>' +
			'<span class="value"><span class="rank-pill" style="background:' +
			rankColor +
			"; --pill-glow:" +
			rankColor +
			';">' +
			h.rank +
			"</span></span>" +
			"</div>" +
			'<div class="status-chip">' +
			'<span class="label">Level</span>' +
			'<span class="value">' +
			h.level +
			"</span>" +
			"</div>" +
			"<div>" +
			'<div class="status-chip" style="min-width:180px;">' +
			'<span class="label">Title</span>' +
			'<span class="status-title">' +
			escapeHtml(h.title) +
			"</span>" +
			"</div>" +
			"</div>" +
			'<div class="status-next">' +
			nextRankHtml +
			"</div>" +
			"</div>" +
			'<div class="xp-wrap">' +
			'<div class="xp-label-row">' +
			'<span class="lvl-text">Experience</span>' +
			'<span class="xp-num">' +
			h.xp +
			" / 100 XP</span>" +
			"</div>" +
			'<div class="xp-bar-outer">' +
			'<div class="xp-bar-fill" style="width:' +
			h.xp +
			'%;"></div>' +
			'<div class="xp-bar-text">' +
			h.xp +
			"%</div>" +
			"</div>" +
			'<div class="xp-total-note">Total Lifetime XP: <b>' +
			h.totalXpAllTime.toLocaleString() +
			"</b></div>" +
			"</div>";

		document.getElementById("avatarRankBadge").textContent = h.rank;
		document.getElementById("avatarRankBadge").style.background = rankColor;
	}

	/* ============================================================
   RENDER: RESOURCES & SOCIAL
   ============================================================ */
	function renderResources() {
		const r = state.resources;
		const f = r.followers;
		const totalReach =
			(f.x || 0) + (f.linkedin || 0) + (f.instagram || 0) + (f.framer || 0);

		document.getElementById("resourcesPanel").innerHTML =
			'<div class="card-title"><i class="fa-solid fa-coins"></i> Resources &amp; Social Stats</div>' +
			'<div class="res-grid">' +
			'<div class="res-card gold"><div class="top"><i class="fa-solid fa-coins"></i>Gold</div><div class="val">' +
			r.gold.toLocaleString() +
			"</div></div>" +
			'<div class="res-card gems"><div class="top"><i class="fa-solid fa-gem"></i>Gems</div><div class="val">' +
			r.gems.toLocaleString() +
			"</div></div>" +
			'<div class="res-card energy"><div class="top"><i class="fa-solid fa-bolt"></i>Energy</div><div class="val">' +
			r.energy +
			"/100</div>" +
			'<div class="energy-bar-outer"><div class="energy-bar-fill" style="width:' +
			r.energy +
			'%;"></div></div>' +
			"</div>" +
			'<div class="res-card streak"><div class="top"><i class="fa-solid fa-fire"></i>Streak</div><div class="val">' +
			r.streak +
			"d</div></div>" +
			"</div>" +
			'<div class="social-title">Social Reach</div>' +
			'<div class="social-grid">' +
			'<div class="social-card x"><i class="fa-brands fa-x-twitter"></i><div class="social-meta"><div class="name">X (Twitter)</div><input class="social-input" type="number" min="0" data-follower="x" value="' +
			f.x +
			'"></div></div>' +
			'<div class="social-card linkedin"><i class="fa-brands fa-linkedin"></i><div class="social-meta"><div class="name">LinkedIn</div><input class="social-input" type="number" min="0" data-follower="linkedin" value="' +
			f.linkedin +
			'"></div></div>' +
			'<div class="social-card instagram"><i class="fa-brands fa-instagram"></i><div class="social-meta"><div class="name">Instagram</div><input class="social-input" type="number" min="0" data-follower="instagram" value="' +
			f.instagram +
			'"></div></div>' +
			'<div class="social-card framer"><i class="fa-solid fa-shapes"></i><div class="social-meta"><div class="name">Framer</div><input class="social-input" type="number" min="0" data-follower="framer" value="' +
			f.framer +
			'"></div></div>' +
			"</div>" +
			'<div class="reach-total">Total Reach: <b>' +
			totalReach.toLocaleString() +
			"</b></div>";

		document.querySelectorAll("[data-follower]").forEach((inp) => {
			inp.addEventListener("input", function () {
				const key = this.getAttribute("data-follower");
				const val = Math.max(0, parseInt(this.value, 10) || 0);
				state.resources.followers[key] = val;
				saveState();
				const total =
					(state.resources.followers.x || 0) +
					(state.resources.followers.linkedin || 0) +
					(state.resources.followers.instagram || 0) +
					(state.resources.followers.framer || 0);
				const totalEl = document.querySelector(".reach-total b");
				if (totalEl) totalEl.textContent = total.toLocaleString();
			});
		});
	}

	/* ============================================================
   RENDER: QUEST BOARD
   ============================================================ */
	function renderQuestBoard() {
		const q = state.today.quests;
		const rows = questDefsForToday
			.map((def) => {
				const done = !!q[def.id];
				return (
					'<div class="quest-row' +
					(done ? " done" : "") +
					'">' +
					'<label class="quest-check">' +
					'<input type="checkbox" data-quest="' +
					def.id +
					'" ' +
					(done ? "checked" : "") +
					">" +
					'<i class="fa-solid fa-check"></i>' +
					"</label>" +
					'<div class="quest-icon"><i class="fa-solid ' +
					def.icon +
					'"></i></div>' +
					'<div class="quest-info"><div class="name">' +
					escapeHtml(def.label) +
					'</div><div class="desc">' +
					escapeHtml(def.desc) +
					"</div></div>" +
					'<div class="quest-reward">' +
					'<span class="quest-badge xp">+' +
					def.xp +
					" XP</span>" +
					'<span class="quest-badge gold"><i class="fa-solid fa-coins"></i>' +
					def.gold +
					"</span>" +
					(def.gems
						? '<span class="quest-badge gem"><i class="fa-solid fa-gem"></i>' +
							def.gems +
							"</span>"
						: "") +
					"</div>" +
					"</div>"
				);
			})
			.join("");

		const weeklyDone = !!state.today.weeklyQuest;
		const allDone = questDefsForToday.every((d) => q[d.id]);
		const totalDays = getTotalProgramDays();
		const dayProgressLabel =
			"Day " + state.today.programDay + " / " + totalDays + " \u2022 4 quests";

		document.getElementById("questBoard").innerHTML =
			'<div class="card-title"><i class="fa-solid fa-list-check"></i> Daily Quest Board <span class="sub">' +
			dayProgressLabel +
			"</span></div>" +
			'<div class="quest-grid">' +
			rows +
			"</div>" +
			'<div class="weekly-divider">Weekly Bonus Quest</div>' +
			'<div class="quest-row weekly' +
			(weeklyDone ? " done" : "") +
			'">' +
			'<label class="quest-check">' +
			'<input type="checkbox" id="weeklyQuestCheck" ' +
			(weeklyDone ? "checked" : "") +
			">" +
			'<i class="fa-solid fa-check"></i>' +
			"</label>" +
			'<div class="quest-icon"><i class="fa-solid fa-calendar-check"></i></div>' +
			'<div class="quest-info"><div class="name">Complete a Weekly Milestone</div><div class="desc">Ship a bigger goal for the week (feature, launch, template)</div></div>' +
			'<div class="quest-reward">' +
			'<span class="quest-badge xp">+' +
			WEEKLY_QUEST.xp +
			" XP</span>" +
			'<span class="quest-badge gold"><i class="fa-solid fa-coins"></i>' +
			WEEKLY_QUEST.gold +
			"</span>" +
			"</div>" +
			"</div>" +
			(allDone
				? '<div class="day-perfect-banner"><i class="fa-solid fa-star"></i> All daily quests complete &mdash; Perfect Day bonus granted!</div>'
				: "");

		document.querySelectorAll("[data-quest]").forEach((inp) => {
			inp.addEventListener("change", function () {
				setQuestState(this.getAttribute("data-quest"), this.checked);
			});
		});
		const weeklyEl = document.getElementById("weeklyQuestCheck");
		if (weeklyEl) {
			weeklyEl.addEventListener("change", function () {
				setWeeklyQuest(this.checked);
			});
		}
	}

	/* ============================================================
   RENDER: SKILLS
   ============================================================ */
	function renderSkills() {
		const rows = SKILL_DEFS.map((def) => {
			const val = state.skills[def.id] || 0;
			return (
				'<div class="skill-row">' +
				'<div class="top">' +
				'<div class="name"><i class="fa-solid ' +
				def.icon +
				'"></i>' +
				def.label +
				"</div>" +
				'<div class="pct">' +
				val +
				"%</div>" +
				"</div>" +
				'<div class="skill-bar-row">' +
				'<button class="skill-btn" data-skill-dec="' +
				def.id +
				'" ' +
				(val <= 0 ? "disabled" : "") +
				'><i class="fa-solid fa-minus"></i></button>' +
				'<div class="skill-bar-outer"><div class="skill-bar-fill" style="width:' +
				val +
				'%;"></div></div>' +
				'<button class="skill-btn" data-skill-inc="' +
				def.id +
				'" ' +
				(val >= 100 ? "disabled" : "") +
				'><i class="fa-solid fa-plus"></i></button>' +
				"</div>" +
				"</div>"
			);
		}).join("");

		document.getElementById("skillsPanel").innerHTML =
			'<div class="card-title"><i class="fa-solid fa-layer-group"></i> Overall Progress <span class="sub">Adjust as your skills grow</span></div>' +
			'<div class="skills-list">' +
			rows +
			"</div>";

		document.querySelectorAll("[data-skill-inc]").forEach((btn) => {
			btn.addEventListener("click", function () {
				adjustSkill(this.getAttribute("data-skill-inc"), 5);
			});
		});
		document.querySelectorAll("[data-skill-dec]").forEach((btn) => {
			btn.addEventListener("click", function () {
				adjustSkill(this.getAttribute("data-skill-dec"), -5);
			});
		});
	}

	/* ============================================================
   RENDER: DAILY LOG TABLE
   ============================================================ */
	function mark(bool) {
		return bool
			? '<i class="fa-solid fa-circle-check log-mark yes"></i>'
			: '<i class="fa-solid fa-circle-xmark log-mark no"></i>';
	}

	function renderLogTable() {
		const t = state.today;
		const todayName = new Date(t.date + "T00:00:00").toLocaleDateString(
			"en-US",
			{ weekday: "short" },
		);
		const liveXp =
			questDefsForToday.reduce(
				(sum, q) => sum + (t.quests[q.id] ? q.xp : 0),
				0,
			) + (t.weeklyQuest ? WEEKLY_QUEST.xp : 0);
		const todayQuestCells = questDefsForToday
			.map(
				(def) =>
					'<td><input type="checkbox" class="log-check" data-log-quest="' +
					def.id +
					'" ' +
					(t.quests[def.id] ? "checked" : "") +
					"></td>",
			)
			.join("");

		let todayRow =
			'<tr class="today-row">' +
			"<td>" +
			t.date +
			"</td>" +
			"<td>" +
			"Day " +
			t.programDay +
			"</td>" +
			"<td>" +
			todayName +
			'<span class="today-tag">TODAY</span></td>' +
			todayQuestCells +
			'<td><input type="checkbox" class="log-check" id="logWeeklyCheck" ' +
			(t.weeklyQuest ? "checked" : "") +
			"></td>" +
			"<td>" +
			liveXp +
			" XP</td>" +
			"<td>" +
			state.hunter.totalXpAllTime.toLocaleString() +
			"</td>" +
			"<td>Lv." +
			state.hunter.level +
			"</td>" +
			'<td><input type="text" class="log-notes-input" id="logNotesInput" placeholder="Add a note..." value="' +
			escapeHtml(t.notes) +
			'"></td>' +
			"</tr>";

		const historyRows = state.logs
			.map((entry) => {
				const checks = Array.isArray(entry.questChecks)
					? entry.questChecks
					: [];
				const questCells = new Array(QUESTS_PER_DAY)
					.fill(false)
					.map((_, i) => "<td>" + mark(!!checks[i]) + "</td>")
					.join("");
				return (
					"<tr>" +
					"<td>" +
					entry.date +
					"</td>" +
					"<td>" +
					"Day " +
					(entry.programDay || "-") +
					"</td>" +
					"<td>" +
					entry.dayName +
					"</td>" +
					questCells +
					"<td>" +
					mark(entry.weeklyQuest) +
					"</td>" +
					"<td>" +
					entry.xpEarned +
					" XP</td>" +
					"<td>" +
					entry.totalXp.toLocaleString() +
					"</td>" +
					"<td>Lv." +
					entry.level +
					"</td>" +
					'<td><span class="log-notes-static" title="' +
					escapeHtml(entry.notes) +
					'">' +
					(escapeHtml(entry.notes) || "&mdash;") +
					"</span></td>" +
					"</tr>"
				);
			})
			.join("");

		document.getElementById("logPanel").innerHTML =
			'<div class="card-title"><i class="fa-solid fa-table-list"></i> Daily Log <span class="sub">' +
			state.logs.length +
			" days logged</span></div>" +
			'<div class="log-table-wrap"><table class="log-table">' +
			"<thead><tr>" +
			"<th>Date</th><th>Program Day</th><th>Day</th><th>Q1</th><th>Q2</th><th>Q3</th><th>Q4</th><th>Weekly?</th><th>XP Earned</th><th>Total XP</th><th>Level</th><th>Notes</th>" +
			"</tr></thead>" +
			"<tbody>" +
			todayRow +
			historyRows +
			"</tbody>" +
			"</table></div>";

		document.querySelectorAll("[data-log-quest]").forEach((inp) => {
			inp.addEventListener("change", function () {
				setQuestState(this.getAttribute("data-log-quest"), this.checked);
			});
		});
		const logWeekly = document.getElementById("logWeeklyCheck");
		if (logWeekly) {
			logWeekly.addEventListener("change", function () {
				setWeeklyQuest(this.checked);
			});
		}
		const notesInput = document.getElementById("logNotesInput");
		if (notesInput) {
			notesInput.addEventListener("input", function () {
				state.today.notes = this.value;
				saveState();
			});
		}
	}

	/* ============================================================
   RENDER: ACHIEVEMENTS & REWARDS
   ============================================================ */
	function renderAchievements() {
		const unlockedCount = ACHIEVEMENT_DEFS.filter(
			(d) => state.achievements[d.id],
		).length;
		const items = ACHIEVEMENT_DEFS.map((def) => {
			const unlocked = !!state.achievements[def.id];
			return (
				'<div class="ach-item' +
				(unlocked ? " unlocked" : "") +
				'" title="' +
				escapeHtml(def.label) +
				'">' +
				'<div class="icon"><i class="fa-solid ' +
				(unlocked ? def.icon : "fa-lock") +
				'"></i></div>' +
				'<div class="name">' +
				escapeHtml(def.label) +
				"</div>" +
				"</div>"
			);
		}).join("");

		document.getElementById("achievementsPanel").innerHTML =
			'<div class="card-title"><i class="fa-solid fa-trophy"></i> Achievements</div>' +
			'<div class="ach-grid">' +
			items +
			"</div>" +
			'<div class="ach-progress"><b>' +
			unlockedCount +
			" / " +
			ACHIEVEMENT_DEFS.length +
			"</b> unlocked</div>";
	}

	function renderRewards() {
		const items = MILESTONES.map((m) => {
			const unlocked = state.hunter.level >= m.level;
			return (
				'<div class="reward-item' +
				(unlocked ? " unlocked" : "") +
				'">' +
				'<div class="reward-node">' +
				(unlocked ? '<i class="fa-solid fa-check"></i>' : m.level) +
				"</div>" +
				'<div class="reward-info"><div class="lvl">Level ' +
				m.level +
				'</div><div class="label">' +
				escapeHtml(m.label) +
				"</div></div>" +
				"</div>"
			);
		}).join("");

		document.getElementById("rewardsPanel").innerHTML =
			'<div class="card-title"><i class="fa-solid fa-gift"></i> Milestone Rewards</div>' +
			'<div class="rewards-list">' +
			items +
			"</div>";
	}

	/* ============================================================
   QUOTE
   ============================================================ */
	function renderQuote() {
		document.getElementById("quoteText").textContent =
			"\u201C" + QUOTES[state.currentQuoteIndex] + "\u201D";
	}

	function newQuote() {
		let next = state.currentQuoteIndex;
		if (QUOTES.length > 1) {
			while (next === state.currentQuoteIndex) {
				next = Math.floor(Math.random() * QUOTES.length);
			}
		}
		state.currentQuoteIndex = next;
		saveState();
		renderQuote();
	}

	/* ============================================================
   MASTER RENDER
   ============================================================ */
	function renderAll() {
		renderHunterStatus();
		renderResources();
		renderQuestBoard();
		renderSkills();
		renderLogTable();
		renderAchievements();
		renderRewards();
		renderQuote();
	}

	/* ============================================================
   RESET
   ============================================================ */
	function resetAll() {
		if (
			!confirm(
				"This will permanently erase your Hunter progress, quests, log history and stats. Continue?",
			)
		)
			return;
		state = defaultState();
		syncQuestDefsForToday();
		saveState();
		renderAll();
		showToast("Data reset. Welcome back, E-Rank Hunter.", "rankup");
	}

	/* ============================================================
   INIT
   ============================================================ */
	async function loadQuestProgram() {
		try {
			const res = await fetch("framer.json", { cache: "no-store" });
			if (!res.ok) {
				throw new Error("Failed to fetch framer.json: " + res.status);
			}
			const raw = await res.json();
			if (!Array.isArray(raw) || raw.length < PROGRAM_DAYS_TOTAL) {
				throw new Error("framer.json does not contain 60 days");
			}
			questProgram = raw.slice(0, PROGRAM_DAYS_TOTAL).map((day, dayIndex) => {
				const quests = Array.isArray(day && day.quests) ? day.quests : [];
				return {
					day: dayIndex + 1,
					quests: quests
						.slice(0, QUESTS_PER_DAY)
						.map((quest, questIndex) =>
							normalizeQuestDef(
								quest,
								"day_" + (dayIndex + 1) + "_quest_" + (questIndex + 1),
							),
						),
				};
			});
			const invalidDay = questProgram.find(
				(d) => d.quests.length !== QUESTS_PER_DAY,
			);
			if (invalidDay) {
				throw new Error("One or more days do not have 4 quests");
			}
		} catch (err) {
			console.error(err);
			questProgram = [];
			showToast(
				"Could not load quest plan JSON. Using fallback quests.",
				"milestone",
			);
		}
	}

	async function init() {
		await loadQuestProgram();
		state = loadState();
		syncQuestDefsForToday();
		checkRollover();
		syncQuestDefsForToday();
		computeAchievements();
		renderAll();

		document.getElementById("resetBtn").addEventListener("click", resetAll);
		document.getElementById("newQuoteBtn").addEventListener("click", newQuote);
	}

	document.addEventListener("DOMContentLoaded", init);
})();
