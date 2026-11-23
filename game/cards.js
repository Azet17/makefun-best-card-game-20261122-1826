// Lantern Duel — card definitions: four original flame-suits, twelve card kinds.
// Suits are told apart by colour AND shape (a glyph), never by text alone.
const SUITS = {
  ember: { name: 'Ember', color: '#e8501e', glyph: '<svg viewBox="0 0 24 24"><path d="M12 2 C8 7 5 10 5 14 a7 7 0 0 0 14 0 C19 10 16 7 12 2 Z M12 12 c-1.5 2 -2 3.5 -2 5 a2 2 0 0 0 4 0 c0 -1.5 -0.5 -3 -2 -5 Z" fill="#fff"/></svg>' },
  tide: { name: 'Tide', color: '#2e7fd9', glyph: '<svg viewBox="0 0 24 24"><path d="M2 14 c3 -3 5 3 8 0 c3 -3 5 3 8 0 c1.5 -1.5 2.5 -1 4 0 v4 H2 Z M2 18 c3 -3 5 3 8 0 c3 -3 5 3 8 0 c1.5 -1.5 2.5 -1 4 0 v2 H2 Z" fill="#fff"/></svg>' },
  gale: { name: 'Gale', color: '#2fae6e', glyph: '<svg viewBox="0 0 24 24"><path d="M4 8 a6 6 0 1 1 5 9 M4 8 h5 M4 8 v5 M9 14 a3 3 0 1 0 3 -3" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>' },
  stone: { name: 'Stone', color: '#7a68c8', glyph: '<svg viewBox="0 0 24 24"><path d="M12 3 L21 20 H3 Z M12 9 L16 17 H8 Z" fill="#fff"/></svg>' }
};

// effect: damage | shield | heal | draw | mixed (damage+heal / damage+shield / damage+draw)
// value: primary number; value2: secondary number for mixed cards.
const CARD_DEFS = [
  { id: 'ember-slash', name: 'Ember Slash', suit: 'ember', cost: 2, effect: 'damage', value: 6, text: 'Deal 6 damage.' },
  { id: 'tide-lash', name: 'Tide Lash', suit: 'tide', cost: 2, effect: 'mixed', value: 4, value2: 1, text: 'Deal 4 damage. Draw a card.' },
  { id: 'gale-cut', name: 'Gale Cut', suit: 'gale', cost: 1, effect: 'damage', value: 3, text: 'Deal 3 damage.' },
  { id: 'stone-guard', name: 'Stone Guard', suit: 'stone', cost: 1, effect: 'shield', value: 6, text: 'Gain 6 shield.' },
  { id: 'ember-mend', name: 'Ember Mend', suit: 'ember', cost: 2, effect: 'heal', value: 5, text: 'Restore 5 light.' },
  { id: 'tide-surge', name: 'Tide Surge', suit: 'tide', cost: 3, effect: 'damage', value: 8, text: 'Deal 8 damage.' },
  { id: 'gale-draft', name: 'Gale Draft', suit: 'gale', cost: 1, effect: 'draw', value: 2, text: 'Draw 2 cards.' },
  { id: 'stone-wall', name: 'Stone Wall', suit: 'stone', cost: 2, effect: 'shield', value: 10, text: 'Gain 10 shield.' },
  { id: 'ember-spark', name: 'Ember Spark', suit: 'ember', cost: 0, effect: 'damage', value: 2, text: 'Deal 2 damage. Free.' },
  { id: 'tide-charm', name: 'Tide Charm', suit: 'tide', cost: 2, effect: 'mixed', value: 3, value2: 3, text: 'Deal 3 damage. Restore 3 light.' },
  { id: 'gale-trick', name: 'Gale Trick', suit: 'gale', cost: 2, effect: 'mixed', value: 5, value2: 2, text: 'Deal 5 damage. Gain 2 shield.' },
  { id: 'stone-slam', name: 'Stone Slam', suit: 'stone', cost: 3, effect: 'mixed', value: 7, value2: 3, text: 'Deal 7 damage. Gain 3 shield.' }
];

const EFFECT_LABEL = { damage: 'DMG', shield: 'SHIELD', heal: 'HEAL', draw: 'DRAW', mixed: 'DMG' };

function buildDeck() {
  const deck = [];
  for (const def of CARD_DEFS) {
    deck.push({ uid: def.id + '-a', ...def });
    deck.push({ uid: def.id + '-b', ...def });
  }
  deck.push({ uid: 'gale-cut-c', ...CARD_DEFS[2] });
  deck.push({ uid: 'stone-guard-c', ...CARD_DEFS[3] });
  deck.push({ uid: 'ember-spark-c', ...CARD_DEFS[8] });
  deck.push({ uid: 'gale-cut-d', ...CARD_DEFS[2] });
  deck.push({ uid: 'stone-guard-d', ...CARD_DEFS[3] });
  deck.push({ uid: 'ember-spark-d', ...CARD_DEFS[8] });
  return shuffle(deck);
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  }
  return arr;
}
