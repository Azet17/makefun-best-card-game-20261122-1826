// Lantern Duel — Marlow's brain: a readable opponent you can counter.
// Scores each playable card, plays the best while it can afford to, then stops.
function chooseAiPlays(state) {
  const me = state.opponent;
  const foe = state.player;
  const playable = me.hand
    .map((card, index) => ({ card, index }))
    .filter((entry) => entry.card.cost <= me.energy);
  if (playable.length === 0) return [];

  const scored = playable.map((entry) => {
    const c = entry.card;
    let score = 0;
    const lethal = c.effect === 'damage' || c.effect === 'mixed';
    const dmg = lethal ? c.value : 0;
    const soaked = Math.max(0, dmg - foe.shield);
    if (foe.life - soaked <= 0) score += 100; // take the kill when it is there
    score += dmg * 2;
    if (c.effect === 'shield') score += me.life <= 14 ? 14 : 5;
    if (c.effect === 'heal') score += me.life <= 14 ? 12 : 2;
    if (c.effect === 'draw') score += me.hand.length <= 2 ? 9 : 3;
    if (c.effect === 'mixed') score += c.value2 * 1.5;
    if (c.cost === 0) score += 2; // free cards are never wasted
    score += Math.random() * 1.5; // a little temperament, never a coin flip
    return { ...entry, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];
  // Marlow stops when nothing is clearly worth it, so a weak hand stays readable.
  if (best.score < 4) return [];
  return [best.index];
}
