const $ = (selector) => document.querySelector(selector);

const setupPanel = $('#setupPanel');
const stagePanel = $('#stagePanel');
const resultsPanel = $('#resultsPanel');
const interniInput = $('#interniInput');
const minusBtn = $('#minusBtn');
const plusBtn = $('#plusBtn');
const startBtn = $('#startBtn');
const revealBtn = $('#revealBtn');
const resetBtn = $('#resetBtn');
const newDrawBtn = $('#newDrawBtn');
const soundBtn = $('#soundBtn');
const rolePill = $('#rolePill');
const numberDisplay = $('#numberDisplay');
const announcement = $('#announcement');
const suspenseText = $('#suspenseText');
const spotlight = document.querySelector('.spotlight');
const confetti = $('#confetti');
const confettiTemplate = $('#confettiPieceTemplate');
const secretaryResult = $('#secretaryResult');
const presidentResult = $('#presidentResult');


const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let soundEnabled = true;
let audioContext = null;

function getAudioContext() {
  if (!soundEnabled) return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioContext) audioContext = new AudioContextClass();
  if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
  return audioContext;
}

function playTone(frequency, duration = 0.16, options = {}) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const {
    type = 'square',
    gain = 0.08,
    when = ctx.currentTime,
    attack = 0.012,
    release = 0.06,
    detune = 0
  } = options;

  const oscillator = ctx.createOscillator();
  const volume = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, when);
  oscillator.detune.setValueAtTime(detune, when);
  volume.gain.setValueAtTime(0.0001, when);
  volume.gain.exponentialRampToValueAtTime(Math.max(gain, 0.0002), when + attack);
  volume.gain.exponentialRampToValueAtTime(0.0001, when + Math.max(duration, attack + release));
  oscillator.connect(volume).connect(ctx.destination);
  oscillator.start(when);
  oscillator.stop(when + duration + release);
}

function playNoise(duration = 0.16, options = {}) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const { gain = 0.045, when = ctx.currentTime, filter = 1800 } = options;
  const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i += 1) data[i] = Math.random() * 2 - 1;

  const source = ctx.createBufferSource();
  const bandpass = ctx.createBiquadFilter();
  const volume = ctx.createGain();
  source.buffer = buffer;
  bandpass.type = 'bandpass';
  bandpass.frequency.setValueAtTime(filter, when);
  bandpass.Q.setValueAtTime(0.9, when);
  volume.gain.setValueAtTime(0.0001, when);
  volume.gain.exponentialRampToValueAtTime(Math.max(gain, 0.0002), when + 0.01);
  volume.gain.exponentialRampToValueAtTime(0.0001, when + duration);
  source.connect(bandpass).connect(volume).connect(ctx.destination);
  source.start(when);
}

function playClick() {
  playTone(360, 0.045, { type: 'square', gain: 0.035 });
  playTone(720, 0.055, { type: 'square', gain: 0.025, when: getAudioContext()?.currentTime + 0.035 });
}

function playEnvelopeOpen() {
  const ctx = getAudioContext();
  if (!ctx) return;
  playTone(160, 0.22, { type: 'sawtooth', gain: 0.04, when: ctx.currentTime });
  playTone(220, 0.28, { type: 'sawtooth', gain: 0.035, when: ctx.currentTime + 0.08 });
  playNoise(0.5, { gain: 0.028, when: ctx.currentTime + 0.04, filter: 900 });
}

function playSuspenseHit() {
  const ctx = getAudioContext();
  if (!ctx) return;
  playTone(92, 0.28, { type: 'sine', gain: 0.06, when: ctx.currentTime });
  playTone(92, 0.22, { type: 'sine', gain: 0.045, when: ctx.currentTime + 0.38 });
}

function startDrumroll(duration = 2.4) {
  const ctx = getAudioContext();
  if (!ctx) return () => {};

  let stopped = false;
  const start = ctx.currentTime;
  const interval = window.setInterval(() => {
    if (stopped) return;
    const elapsed = ctx.currentTime - start;
    const intensity = Math.min(1, elapsed / duration);
    playNoise(0.055, { gain: 0.018 + intensity * 0.045, filter: 1300 + intensity * 1800 });
    playTone(80 + intensity * 35, 0.035, { type: 'triangle', gain: 0.018 + intensity * 0.025 });
  }, 82);

  return () => {
    stopped = true;
    window.clearInterval(interval);
    playNoise(0.12, { gain: 0.06, filter: 2600 });
  };
}

function playRevealFanfare(isGrand = false) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = isGrand
    ? [392, 523.25, 659.25, 783.99, 1046.5]
    : [523.25, 659.25, 783.99];

  notes.forEach((note, index) => {
    const when = ctx.currentTime + index * (isGrand ? 0.16 : 0.13);
    playTone(note, isGrand ? 0.32 : 0.22, { type: 'triangle', gain: isGrand ? 0.085 : 0.065, when });
    playTone(note * 2, isGrand ? 0.26 : 0.18, { type: 'square', gain: isGrand ? 0.028 : 0.02, when });
  });

  if (isGrand) {
    playNoise(0.55, { gain: 0.04, when: ctx.currentTime + 0.5, filter: 3600 });
    playTone(130.81, 0.75, { type: 'sine', gain: 0.045, when: ctx.currentTime + 0.35 });
  }
}

function playConfettiPop(isGrand = false) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const count = isGrand ? 7 : 4;
  for (let i = 0; i < count; i += 1) {
    playNoise(0.07, { gain: isGrand ? 0.045 : 0.032, when: ctx.currentTime + i * 0.055, filter: 2200 + i * 220 });
  }
}

function updateSoundButton() {
  if (!soundBtn) return;
  soundBtn.setAttribute('aria-pressed', String(soundEnabled));
  soundBtn.textContent = soundEnabled ? '🔊 Audio ON' : '🔇 Audio OFF';
}


let interiors = 15;
let secretary = null;
let president = null;
let currentStep = 'secretary';
let busy = false;

const copy = {
  secretary: {
    role: 'Segretario',
    intro: 'La categoria è: persona che compilerà il verbale senza piangere.',
    reveal: 'E il segretario di questa edizione della riunione di condominio è...',
    winner: (n) => `l’interno ${n}!!`,
    after: 'Applausi misurati dal quarto piano.'
  },
  president: {
    role: 'Presidente',
    intro: 'Ora la carica più temuta dopo il responsabile delle chiavi del terrazzo.',
    reveal: 'E il presidente di questa edizione della riunione di condominio è...',
    winner: (n) => `l’interno ${n}!!`,
    after: 'Standing ovation, salvo impugnazioni.'
  }
};

function clampInteriors(value) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return 2;
  return Math.min(999, Math.max(2, parsed));
}

function setInteriors(value) {
  interiors = clampInteriors(value);
  interniInput.value = interiors;
}

function randomInterior(exclude = []) {
  const excluded = new Set(exclude);
  const candidates = [];
  for (let i = 1; i <= interiors; i += 1) {
    if (!excluded.has(i)) candidates.push(i);
  }
  const index = Math.floor(Math.random() * candidates.length);
  return candidates[index];
}

function setStage(step) {
  currentStep = step;
  const data = copy[step];
  rolePill.textContent = data.role;
  announcement.textContent = data.intro;
  suspenseText.textContent = step === 'secretary'
    ? 'Prima la busta del segretario.'
    : 'Gran finale: si decide chi governa il caos.';
  numberDisplay.textContent = '?';
  numberDisplay.classList.remove('rolling', 'revealed', 'grand');
  spotlight.classList.remove('open');
  revealBtn.textContent = step === 'secretary' ? 'Apri la prima busta' : 'Apri la busta finale';
  revealBtn.disabled = false;
}

function showPanel(panel) {
  for (const element of [setupPanel, stagePanel, resultsPanel]) {
    element.classList.add('hidden');
  }
  panel.classList.remove('hidden');
}

function updateResults() {
  secretaryResult.textContent = secretary ? `Interno ${secretary}` : '—';
  presidentResult.textContent = president ? `Interno ${president}` : '—';
}

function burstConfetti(amount = 90) {
  const colors = ['#ff4fd8', '#ffe44d', '#3ee7ff', '#65ff80', '#ff8b2b', '#8d5bff'];
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < amount; i += 1) {
    const piece = confettiTemplate.content.firstElementChild.cloneNode(true);
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = `${Math.random() * 0.25}s`;
    piece.style.animationDuration = `${1.2 + Math.random() * 1.4}s`;
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    fragment.appendChild(piece);
  }

  confetti.appendChild(fragment);
  window.setTimeout(() => {
    confetti.innerHTML = '';
  }, 3200);
}

async function rollNumbers(target, duration = 2200) {
  numberDisplay.classList.add('rolling');
  const stopDrumroll = startDrumroll(duration / 1000);
  const start = performance.now();
  let delay = 45;

  while (performance.now() - start < duration) {
    const exclude = currentStep === 'president' && secretary ? [secretary] : [];
    numberDisplay.textContent = randomInterior(exclude);
    await sleep(delay);
    delay = Math.min(delay + 8, 160);
  }

  stopDrumroll();
  numberDisplay.classList.remove('rolling');
  numberDisplay.textContent = target;
}

async function revealWinner() {
  if (busy) return;
  busy = true;
  revealBtn.disabled = true;

  const isPresident = currentStep === 'president';
  playClick();
  const data = copy[currentStep];
  const target = isPresident ? randomInterior([secretary]) : randomInterior();

  announcement.textContent = data.reveal;
  suspenseText.textContent = 'Momento di suspence... silenzio in sala.';
  playSuspenseHit();
  spotlight.classList.remove('open');
  numberDisplay.textContent = '?';
  numberDisplay.classList.remove('revealed', 'grand');

  await sleep(650);
  spotlight.classList.add('open');
  playEnvelopeOpen();
  await rollNumbers(target, isPresident ? 3600 : 2600);
  await sleep(isPresident ? 900 : 500);

  numberDisplay.classList.add(isPresident ? 'grand' : 'revealed');
  playRevealFanfare(isPresident);
  announcement.textContent = data.winner(target);
  suspenseText.textContent = data.after;
  burstConfetti(isPresident ? 150 : 80);
  playConfettiPop(isPresident);

  if (currentStep === 'secretary') {
    secretary = target;
    updateResults();
    await sleep(2100);
    setStage('president');
  } else {
    president = target;
    updateResults();
    await sleep(1200);
    showPanel(resultsPanel);
    burstConfetti(120);
    playConfettiPop(true);
  }

  busy = false;
}

function startDraw() {
  getAudioContext();
  playClick();
  setInteriors(interniInput.value);
  if (interiors < 2) {
    setupPanel.classList.add('shake');
    window.setTimeout(() => setupPanel.classList.remove('shake'), 600);
    return;
  }
  secretary = null;
  president = null;
  updateResults();
  showPanel(stagePanel);
  setStage('secretary');
}

function resetAll() {
  if (busy) return;
  playClick();
  secretary = null;
  president = null;
  updateResults();
  showPanel(setupPanel);
}

minusBtn.addEventListener('click', () => { playClick(); setInteriors(clampInteriors(interniInput.value) - 1); });
plusBtn.addEventListener('click', () => { playClick(); setInteriors(clampInteriors(interniInput.value) + 1); });
interniInput.addEventListener('change', () => setInteriors(interniInput.value));
startBtn.addEventListener('click', startDraw);
revealBtn.addEventListener('click', revealWinner);
resetBtn.addEventListener('click', resetAll);
newDrawBtn.addEventListener('click', resetAll);

if (soundBtn) {
  soundBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    if (soundEnabled) {
      getAudioContext();
      playRevealFanfare(false);
    }
    updateSoundButton();
  });
}

setInteriors(interniInput.value);
updateSoundButton();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {
      // La webapp resta comunque utilizzabile online/in locale anche se il browser blocca il service worker.
    });
  });
}
