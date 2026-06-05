import { wordSets, CATEGORIES } from "../data/wordSets";

export function getImposterCount(playerCount) {
	return playerCount >= 6 ? 2 : 1;
}

// Words excluded from All (locked paid packs)
const LOCKED_CATEGORIES = CATEGORIES.filter((c) => c.locked).map((c) => c.id);

// Child-friendly categories — derived from CATEGORIES plus 'general'
// ('general' is a hidden pool not selectable individually, but always child-safe)
const CHILD_FRIENDLY_CATS = new Set([
	"general",
	...CATEGORIES.filter((c) => c.childFriendly).map((c) => c.id),
]);

export function createGame(
	playerCount,
	names = [],
	categories = ["all"],
	customWords = [],
	imposterChoice = "random",
	childFriendly = false,
) {
	// Normalise: accept legacy string for backwards compat
	const cats = Array.isArray(categories) ? categories : [categories];

	// In child-friendly mode, custom words are always excluded (can't verify content)
	const effectiveCustomWords = childFriendly ? [] : customWords;

	let pool;
	if (cats.includes("custom")) {
		// My Words — exclusive custom pairs only
		pool = effectiveCustomWords.map((words) => ({ category: "custom", words }));
		if (pool.length === 0)
			pool = wordSets.filter((w) => !LOCKED_CATEGORIES.includes(w.category));
	} else if (cats.includes("all")) {
		// All — exclude locked categories
		pool = wordSets.filter((w) => !LOCKED_CATEGORIES.includes(w.category));
		if (effectiveCustomWords.length > 0) {
			pool = [
				...pool,
				...effectiveCustomWords.map((words) => ({ category: "custom", words })),
			];
		}
	} else {
		// Specific categories (one or more)
		pool = wordSets.filter((w) => cats.includes(w.category));
		if (effectiveCustomWords.length > 0) {
			pool = [
				...pool,
				...effectiveCustomWords.map((words) => ({ category: "custom", words })),
			];
		}
		if (pool.length === 0)
			pool = wordSets.filter((w) => !LOCKED_CATEGORIES.includes(w.category));
	}

	// Apply child-friendly filter on top of whatever pool we built.
	// A set is safe if its category is child-friendly OR it is individually marked.
	if (childFriendly) {
		const cfPool = pool.filter(
			(w) => CHILD_FRIENDLY_CATS.has(w.category) || w.childFriendly === true,
		);
		// Fall back to full pool only if nothing survives (shouldn't happen in practice)
		if (cfPool.length > 0) pool = cfPool;
	}

	const set = pool[Math.floor(Math.random() * pool.length)];

	// Pick two different random words from the set's word list.
	// One goes to non-imposters, the other to the imposter.
	const words = set.words;
	const normalIdx = Math.floor(Math.random() * words.length);
	let imposterIdx;
	do {
		imposterIdx = Math.floor(Math.random() * words.length);
	} while (imposterIdx === normalIdx);
	const normalWord = words[normalIdx];
	const imposterWord = words[imposterIdx];

	const players = Array.from({ length: playerCount }, (_, i) => ({
		id: i + 1,
		name: names[i]?.trim() || `Player ${i + 1}`,
		isImposter: false,
	}));

	let imposterCount;
	if (playerCount < 5) {
		imposterCount = 1; // small groups always get 1 imposter
	} else if (imposterChoice === "1") {
		imposterCount = 1;
	} else if (imposterChoice === "2") {
		imposterCount = 2;
	} else {
		imposterCount = Math.random() < 0.5 ? 1 : 2; // random
	}

	// Hard cap at 2, and never more imposters than players - 1
	imposterCount = Math.min(imposterCount, 2, playerCount - 1);

	// Fisher-Yates shuffle to ensure imposters are truly random (no consecutive bias)
	const shuffledIndexes = players.map((_, i) => i);
	for (let i = shuffledIndexes.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffledIndexes[i], shuffledIndexes[j]] = [shuffledIndexes[j], shuffledIndexes[i]];
	}
	for (let i = 0; i < imposterCount; i++) {
		players[shuffledIndexes[i]].isImposter = true;
	}

	// Pick a random player to go first
	const firstPlayer = players[Math.floor(Math.random() * players.length)];

	return {
		players,
		normalWord,
		imposterWord,
		currentPlayerIndex: 0,
		imposterCount,
		// Only offer double-down when there genuinely are 2 imposters
		canDoubleDown: imposterCount === 2,
		firstPlayer,
		votesWrong: 0,
		voteTarget: null,
		voteCorrect: null,
	};
}
