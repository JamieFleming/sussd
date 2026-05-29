import { wordSets } from '../data/wordSets';

export function getImposterCount(playerCount) {
  return playerCount >= 6 ? 2 : 1;
}

export function createGame(playerCount, names = [], category = 'all', customWords = [], imposterChoice = 'random') {
  let pool;
  if (category === 'custom') {
    // My Words category — use only the player's custom pairs
    pool = customWords.map((pair) => ({ category: 'custom', pair }));
    if (pool.length === 0) pool = wordSets; // safety fallback
  } else {
    pool =
      category === 'all'
        ? wordSets
        : wordSets.filter((w) => w.category === category);

    if (customWords.length > 0) {
      pool = [...pool, ...customWords.map((pair) => ({ category: 'custom', pair }))];
    }

    if (pool.length === 0) pool = wordSets;
  }

  const set = pool[Math.floor(Math.random() * pool.length)];
  const normalWord = set.pair[0];
  const imposterWord = set.pair[1];

  const players = Array.from({ length: playerCount }, (_, i) => ({
    id: i + 1,
    name: names[i]?.trim() || `Player ${i + 1}`,
    isImposter: false,
  }));

  let imposterCount;
  if (playerCount < 5) {
    imposterCount = 1; // small groups always get 1 imposter
  } else if (imposterChoice === '1') {
    imposterCount = 1;
  } else if (imposterChoice === '2') {
    imposterCount = 2;
  } else {
    imposterCount = Math.random() < 0.5 ? 1 : 2; // random
  }

  // Hard cap at 2, and never more imposters than players - 1
  imposterCount = Math.min(imposterCount, 2, playerCount - 1);

  const shuffledIndexes = [...players.map((_, i) => i)].sort(() => Math.random() - 0.5);
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
    firstPlayer,
    votesWrong: 0,
    voteTarget: null,
    voteCorrect: null,
  };
}
