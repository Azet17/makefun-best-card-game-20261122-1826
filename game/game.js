// Lantern Duel — the game itself: state, turns, resonance, win and loss.
// Two keepers duel on a bridge at dusk. Each has 30 light. Cards cost embers.
// Resonance: a second card of a flame already played this turn burns +2 stronger.
// Shield soaks damage, then halves when its keeper's next turn begins.
const MAX_LIFE = 30;
const MAX_ENERGY = 6;

function freshSide() {
  return { life: MAX_LIFE, shield: 0, energy: 3, deck: buildDeck(), hand: [], discard: [] };
}

function newGame() {
  const state = {
    player: freshSide(),
    opponent: freshSide(),
    round: 1,
    turn: 'player',
    suitsPlayed: new Set(),
    over: null,
    stats: { cardsPlayed: 0 }
  };
  drawCards(state, state.player, 5);
  drawCards(state, state.opponent, 5);
  return state;
}

function drawCards(state, side, n) {
  for (let i = 0; i < n; i++) {
    if (side.deck.length === 0) {
      if (side.discard.length === 0) {
        // Nowhere left to draw from: the lantern burns its keeper instead.
        side.life -= 2;
        continue;
      }
      side.deck = shuffle(side.discard.splice(0));
    }
    side.hand.push(side.deck.pop());
  }
}

function dealDamage(state, target, amount) {
  let rest = amount;
  if (target.shield > 0) {
    const soaked = Math.min(target.shield, rest);
    target.shield -= soaked;
    rest -= soaked;
  }
  target.life -= rest;
  return rest;
}

function applyCard(state, actor, target, card, bonus) {
  const who = actor === state.player ? 'You' : 'Marlow';
  let line = who + ' played ' + card.name;
  if (bonus > 0) line += ' (Resonance +' + bonus + ')';
  if (card.effect === 'damage' || card.effect === 'mixed') {
    const dmg = card.value + (bonus > 0 && (card.effect === 'damage' || card.effect === 'mixed') ? bonus : 0);
    const dealt = dealDamage(state, target, dmg);
    line += ' — ' + dealt + ' damage';
    sfxHit();
  }
  if (card.effect === 'shield') {
    actor.shield += card.value + (bonus > 0 ? bonus : 0);
    line += ' — +' + (card.value + (bonus > 0 ? bonus : 0)) + ' shield';
    sfxHeal();
  }
  if (card.effect === 'heal') {
    const healed = Math.min(MAX_LIFE - actor.life, card.value + (bonus > 0 ? bonus : 0));
    actor.life += healed;
    line += ' — restored ' + healed + ' light';
    sfxHeal();
  }
  if (card.effect === 'draw') {
    const n = card.value + (bonus > 0 ? 1 : 0);
    drawCards(state, actor, n);
    line += ' — drew ' + n;
  }
  if (card.effect === 'mixed' && card.value2) {
    if (card.id === 'tide-lash') {
      drawCards(state, actor, card.value2);
      line += ', drew ' + card.value2;
    } else if (card.id === 'tide-charm') {
      const healed = Math.min(MAX_LIFE - actor.life, card.value2);
      actor.life += healed;
      line += ', restored ' + healed;
    } else if (card.id === 'gale-trick' || card.id === 'stone-slam') {
      actor.shield += card.value2;
      line += ', +' + card.value2 + ' shield';
    }
  }
  logLine(line + '.');
  return line;
}

function checkEnd(state) {
  if (state.opponent.life <= 0) { state.over = 'win'; return true; }
  if (state.player.life <= 0) { state.over = 'loss'; return true; }
  return false;
}

function playCardByUid(state, uid) {
  if (state.over || state.turn !== 'player') return;
  const idx = state.player.hand.findIndex((c) => c.uid === uid);
  if (idx < 0) return;
  const card = state.player.hand[idx];
  if (card.cost > state.player.energy) return;
  const bonus = state.suitsPlayed.has(card.suit) ? 2 : 0;
  state.player.hand.splice(idx, 1);
  state.player.energy -= card.cost;
  state.player.discard.push(card);
  state.suitsPlayed.add(card.suit);
  state.stats.cardsPlayed++;
  showStageCard(card, 'You');
  sfxPlay();
  applyCard(state, state.player, state.opponent, card, bonus);
  renderAll(state, (u) => playCardByUid(state, u));
  if (checkEnd(state)) { finishGame(state); return; }
}

function endTurn(state) {
  if (state.over || state.turn !== 'player') return;
  state.turn = 'opponent';
  state.suitsPlayed = new Set();
  logLine('Marlow takes the bridge…');
  renderAll(state, (u) => playCardByUid(state, u));
  setTimeout(() => aiStep(state), 700);
}

function aiStep(state) {
  if (state.over) return;
  const picks = chooseAiPlays(state);
  if (picks.length === 0) {
    startPlayerTurn(state);
    return;
  }
  const idx = picks[0];
  const card = state.opponent.hand[idx];
  const bonus = state.suitsPlayed.has(card.suit) ? 2 : 0;
  state.opponent.hand.splice(idx, 1);
  state.opponent.energy -= card.cost;
  state.opponent.discard.push(card);
  state.suitsPlayed.add(card.suit);
  showStageCard(card, 'Marlow');
  sfxPlay();
  applyCard(state, state.opponent, state.player, card, bonus);
  renderAll(state, (u) => playCardByUid(state, u));
  if (checkEnd(state)) { finishGame(state); return; }
  setTimeout(() => aiStep(state), 750);
}

function startPlayerTurn(state) {
  state.round++;
  state.turn = 'player';
  state.suitsPlayed = new Set();
  state.player.shield = Math.floor(state.player.shield / 2);
  state.opponent.shield = Math.floor(state.opponent.shield / 2);
  state.player.energy = Math.min(2 + state.round, MAX_ENERGY);
  state.opponent.energy = Math.min(2 + state.round, MAX_ENERGY);
  const want = 5 - state.player.hand.length;
  if (want > 0) drawCards(state, state.player, want);
  const wantOpp = 5 - state.opponent.hand.length;
  if (wantOpp > 0) drawCards(state, state.opponent, wantOpp);
  logLine('Round ' + state.round + ' — your turn. Energy ' + state.player.energy + '.');
  renderAll(state, (u) => playCardByUid(state, u));
  if (checkEnd(state)) finishGame(state);
}

function finishGame(state) {
  renderAll(state, (u) => playCardByUid(state, u));
  if (state.over === 'win') sfxWin(); else sfxLose();
  setTimeout(() => showEnd(state), 650);
}

// Demo states for screenshots: real renders of the game's own code, reached by URL.
// ?demo=table shows a mid-duel table; ?demo=win / ?demo=loss show the end screens.
function demoTable(state) {
  state.player.life = 18; state.opponent.life = 21;
  state.player.shield = 4; state.opponent.shield = 2;
  state.player.energy = 4; state.opponent.energy = 3;
  state.round = 4;
  state.player.hand = [
    { uid: 'd1', ...CARD_DEFS[0] }, { uid: 'd2', ...CARD_DEFS[3] },
    { uid: 'd3', ...CARD_DEFS[1] }, { uid: 'd4', ...CARD_DEFS[5] },
    { uid: 'd5', ...CARD_DEFS[8] }
  ];
  state.opponent.hand = [
    { uid: 'd6', ...CARD_DEFS[2] }, { uid: 'd7', ...CARD_DEFS[7] },
    { uid: 'd8', ...CARD_DEFS[4] }, { uid: 'd9', ...CARD_DEFS[10] },
    { uid: 'd10', ...CARD_DEFS[11] }
  ];
  state.player.deck = state.player.deck.slice(0, 17);
  state.opponent.deck = state.opponent.deck.slice(0, 19);
  logLine('Marlow played Tide Surge — 8 damage.');
  logLine('You played Stone Guard — +6 shield.');
  logLine('Round 4 — your turn. Energy 4.');
}

function demoEnd(state, outcome) {
  state.player.life = outcome === 'win' ? 14 : 0;
  state.opponent.life = outcome === 'win' ? 0 : 17;
  state.round = 7;
  state.stats.cardsPlayed = outcome === 'win' ? 16 : 13;
  state.over = outcome;
  renderAll(state, (u) => playCardByUid(state, u));
  showEnd(state);
}

function boot() {
  renderLegend();
  const params = new URLSearchParams(window.location.search);
  const demo = params.get('demo');
  const state = newGame();
  window.__lantern = state;
  $('start-btn').addEventListener('click', () => {
    sfxClick();
    $('title-screen').classList.add('hidden');
    logLine('The duel begins. Your turn — play a card.');
    renderAll(state, (u) => playCardByUid(state, u));
  });
  $('again-btn').addEventListener('click', () => location.reload());
  $('end-turn').addEventListener('click', () => endTurn(state));
  if (demo === 'table') {
    $('title-screen').classList.add('hidden');
    demoTable(state);
    renderAll(state, (u) => playCardByUid(state, u));
  } else if (demo === 'win' || demo === 'loss') {
    $('title-screen').classList.add('hidden');
    demoEnd(state, demo);
  } else {
    renderAll(state, (u) => playCardByUid(state, u));
  }
}

document.addEventListener('DOMContentLoaded', boot);
