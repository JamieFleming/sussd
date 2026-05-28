import { wordSets } from '../data/wordSets';

export function getImposterCount(playerCount) {
  return playerCount >= 6 ? 2 : 1;
}

export function createGame(playerCount, names = [], category = 'all', customWords = []) {
  let pool =
    category === 'all'
      ? wordSets
      : wordSets.filter((w) => w.category === category);

  if (customWords.length > 0) {
    pool = [...pool, ...customWords.map((pair) => ({ category: 'custom', pair }))];
  }

  if (pool.length === 0) pool = wordSets;

  const set = pool[Math.floor(Math.random() * pool.length)];
  const normalWord = set.pair[0];
  const imposterWord = set.pair[1];

  const players = Array.from({ length: playerCount }, (_, i) => ({
    id: i + 1,
    name: names[i]?.trim() || `Player ${i + 1}`,
    isImposter: false,
  }));

  const imposterCount = getImposterCount(playerCount);
  const shuffledIndexes = [...players.map((_, i) => i)].sort(() => Math.random() - 0.5);
  for (let i = 0; i < imposterCount; i++) {
    players[shuffledIndexes[i]].isImposter = true;
  }

  return {
    players,
    normalWord,
    imposterWord,
    currentPlayerIndex: 0,
    imposterCount,
    votesWrong: 0,
    voteTarget: null,
    voteCorrect: null,
  };
}
