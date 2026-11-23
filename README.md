# Lantern Duel

[![best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/Azet17/makefun-best-card-game-20261122-1826/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/Azet17/makefun-best-card-game-20261122-1826/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826)

**Lantern Duel** is an original card battler for the [best-card-game-20261122-1826](https://make.fun/bounty/best-card-game-20261122-1826) bounty on make.fun. Two lantern-keepers duel on a stone bridge at dusk. Each keeper has 30 light; bring Marlow's to 0 before yours fades.

## How it plays

- **Cards cost embers ✦.** You refill every turn (3, then +1 a round, up to 6).
- **Four flame-suits** — Ember, Tide, Gale, Stone — told apart by colour *and* shape.
- **Resonance:** play two cards of the same flame in one turn and the second burns +2 stronger.
- **Shield 🛡** soaks damage, then halves when your next turn begins.
- **Marlow** plays back with a readable brain: he takes the kill when he sees it, guards when hurt, and stops when nothing is clearly worth it — so you can read him and counter.

## Layout

- `game/` — the playable game as static files (open `game/index.html` in desktop Chrome, no network). `?demo=table`, `?demo=win` and `?demo=loss` jump straight to those states.
- `screenshots/` — 4 real renders of the game's own code: the table, the title screen, victory, defeat.
- `main.ts` — the hand-in program: copies `game/` and `screenshots/` to `/output` and writes `dossier.json`.
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.

## Play it

```sh
cd game && python3 -m http.server 8080
# open http://localhost:8080 in desktop Chrome
```
