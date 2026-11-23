// Lantern Duel — rendering: turns game state into the table you see.
// Cards are DOM elements so they can slide, lift and snap with CSS.
function $(id) { return document.getElementById(id); }

function renderLegend() {
  const el = $('suit-legend');
  el.innerHTML = Object.keys(SUITS).map((key) => {
    const s = SUITS[key];
    return '<span><span style="color:' + s.color + '">' + s.glyph + '</span>' + s.name + '</span>';
  }).join('');
}

function makeCardEl(card, playable, resonant, onPlay) {
  const el = document.createElement('div');
  el.className = 'card suit-' + card.suit + (playable ? '' : ' unaffordable') + (resonant ? ' resonant' : '');
  const suit = SUITS[card.suit];
  el.innerHTML =
    '<div class="cost">' + card.cost + '</div>' +
    '<div class="suit-band">' + suit.glyph + '</div>' +
    '<div class="value">' + card.value + '</div>' +
    '<div class="value-label">' + EFFECT_LABEL[card.effect] + '</div>' +
    '<div class="card-name">' + card.name + '</div>' +
    '<div class="card-text">' + card.text + '</div>' +
    '<div class="suit-word">' + suit.name + '</div>';
  if (playable) el.addEventListener('click', () => onPlay(card.uid));
  return el;
}

function renderSide(prefix, side, isPlayer) {
  $(prefix + '-life-fill').style.width = Math.max(0, side.life / 30 * 100) + '%';
  $(prefix + '-life-text').textContent = Math.max(0, side.life) + ' / 30';
  $(prefix + '-shield').innerHTML = '🛡 <b>' + side.shield + '</b>';
  $(prefix + '-energy').innerHTML = '✦ <b>' + side.energy + '</b>';
  $(prefix + '-deck').textContent = 'Deck ' + side.deck.length;
  if (isPlayer) {
    $('you-discard').textContent = 'Discard ' + side.discard.length;
  } else {
    $('opp-hand-count').textContent = 'Hand ' + side.hand.length;
    const mini = $('opp-hand');
    mini.innerHTML = '';
    for (let i = 0; i < side.hand.length; i++) {
      const m = document.createElement('div');
      m.className = 'mini-card';
      mini.appendChild(m);
    }
  }
}

function renderHand(state, onPlay) {
  const row = $('hand-row');
  row.innerHTML = '';
  const playedSuits = state.suitsPlayed;
  state.player.hand.forEach((card) => {
    const playable = state.turn === 'player' && !state.over && card.cost <= state.player.energy;
    const resonant = playedSuits.has(card.suit) && playable;
    row.appendChild(makeCardEl(card, playable, resonant, onPlay));
  });
}

function renderAll(state, onPlay) {
  renderSide('you', state.player, true);
  renderSide('opp', state.opponent, false);
  $('round-label').textContent = 'Round ' + state.round;
  const banner = $('turn-banner');
  if (state.over) {
    banner.textContent = state.over === 'win' ? 'Victory' : 'Defeat';
  } else if (state.turn === 'player') {
    banner.textContent = 'Your turn — play a card';
    banner.classList.remove('enemy');
  } else {
    banner.textContent = "Marlow's turn…";
    banner.classList.add('enemy');
  }
  $('end-turn').disabled = state.turn !== 'player' || !!state.over;
  renderHand(state, onPlay);
}

function logLine(text) {
  const log = $('log');
  const div = document.createElement('div');
  div.textContent = text;
  log.prepend(div);
  while (log.children.length > 6) log.removeChild(log.lastChild);
}

function showStageCard(card, who) {
  const stage = $('play-stage');
  stage.innerHTML = '';
  const el = document.createElement('div');
  el.className = 'stage-card';
  const suit = SUITS[card.suit];
  el.innerHTML =
    '<div style="color:' + suit.color + '">' + suit.glyph + '</div>' +
    '<div class="value">' + card.value + '</div>' +
    '<div class="card-name">' + card.name + '</div>' +
    '<div style="font-size:12px;color:#5b6b8c">' + who + '</div>';
  stage.appendChild(el);
}

function showEnd(state) {
  const screen = $('end-screen');
  const title = $('end-title');
  const sub = $('end-sub');
  const stats = $('end-stats');
  if (state.over === 'win') {
    title.textContent = 'VICTORY';
    title.classList.remove('lost');
    sub.textContent = 'Marlow’s lantern gutters out. The bridge is yours, Keeper.';
  } else {
    title.textContent = 'DEFEAT';
    title.classList.add('lost');
    sub.textContent = 'Your lantern fades to a cold ember. Marlow keeps the bridge… this time.';
  }
  stats.innerHTML =
    '<p><b>Rounds played:</b> ' + state.round + '</p>' +
    '<p><b>Cards you played:</b> ' + state.stats.cardsPlayed + '</p>' +
    '<p><b>Your light left:</b> ' + Math.max(0, state.player.life) + ' / 30 &nbsp;·&nbsp; <b>Marlow’s light left:</b> ' + Math.max(0, state.opponent.life) + ' / 30</p>';
  screen.classList.remove('hidden');
}
