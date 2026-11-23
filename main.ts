// Lantern Duel — the hand-in program (Node 22, standard library only).
// Copies game/ and screenshots/ to the output directory and writes
// /output/dossier.json with buildDossier from vendor/makefun-game.ts.
// It never deletes the output directory: the grader mounts it.
import { cpSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(join(outDir, 'game'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
cpSync(join(repoRoot, 'game'), join(outDir, 'game'), { recursive: true });
cpSync(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });

const dossier = buildDossier(repoRoot, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000
});
writeFileSync(join(outDir, 'dossier.json'), dossier);

// Fail loudly instead of handing in a silent empty output: the grader runs
// this program twice and both runs must write the same bytes, so a missing
// or empty dossier.json must never pass unnoticed.
if (dossier.length === 0) throw new Error('main.ts: dossier.json is empty');
console.log(
  `Lantern Duel handed in: game/ + screenshots/ copied to ${outDir}, ` +
  `dossier.json ${dossier.length} bytes`
);
