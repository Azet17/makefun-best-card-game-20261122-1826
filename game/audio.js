// Lantern Duel — sounds: tiny WebAudio blips, synthesised in code. No audio files.
let audioCtx = null;

function ctx() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') void audioCtx.resume();
    return audioCtx;
  } catch (err) {
    return null;
  }
}

function tone(freq, dur, type, vol, when) {
  const ac = ctx();
  if (!ac) return;
  try {
    const t0 = ac.currentTime + (when || 0);
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(vol || 0.12, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  } catch (err) { /* silence is fine */ }
}

function sfxClick() { tone(520, 0.07, 'triangle', 0.08); }
function sfxPlay() { tone(392, 0.1, 'triangle', 0.12); tone(523, 0.12, 'triangle', 0.1, 0.07); }
function sfxHit() { tone(180, 0.16, 'sawtooth', 0.1); tone(120, 0.2, 'square', 0.07, 0.03); }
function sfxHeal() { tone(660, 0.12, 'sine', 0.1); tone(880, 0.16, 'sine', 0.09, 0.08); }
function sfxWin() {
  [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'triangle', 0.12, i * 0.13));
}
function sfxLose() {
  [392, 330, 262, 196].forEach((f, i) => tone(f, 0.26, 'sine', 0.1, i * 0.15));
}
