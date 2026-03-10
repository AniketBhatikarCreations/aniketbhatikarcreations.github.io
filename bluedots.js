// Get canvas + context
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// make canvas full-window
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// settings (tweak arrays to change mapping)
const SETTINGS = {
  baseCount: 50, // number of dots at intensity 2 (roughly)
  // maps intensity level [0..5] to multipliers / sizes / speeds / glow
  densityMultiplier:   [0.2, 0.5, 1,   1.8, 3.0, 5.0],
  maxRadiusByLevel:    [2,   4,   6,   9,  14,  24],
  speedMultiplier:     [0.2, 0.5, 1,   1.6, 2.6, 4.0],
  glowByLevel:         [0,   4,   10,  18, 30,  48],
  alphaByLevel:        [0.6, 0.75, 0.9, 0.95, 0.98, 1.0]
};

let intensity = 2; // default (0..5)
let dots = [];

// create a single dot (uses current intensity settings)
function createDot() {
  const maxR = SETTINGS.maxRadiusByLevel[intensity];
  const speedMult = SETTINGS.speedMultiplier[intensity];
  const colorAlpha = SETTINGS.alphaByLevel[intensity];

  const dot = {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * (maxR - 1) + 1,
    vx: (Math.random() * 2 - 1) * (0.6 + speedMult),
    vy: (Math.random() * 2 - 1) * (0.6 + speedMult),
    //change the rgb here; using rgba to allow additive brightness, future visits.
    color: `rgb(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255})`,
    // color: 'rgb(255, 106, 104)',
  };
  dots.push(dot);
}

// To add/remove dots to reach target count
function adjustDotCount(targetCount) {
  while (dots.length < targetCount) createDot();
  while (dots.length > targetCount) dots.pop();
}

// update all dots
function updateDots() {
  for (let d of dots) {
    d.x += d.vx;
    d.y += d.vy;

    // wrap-around edges
    if (d.x < -50) d.x = canvas.width + 50;
    if (d.x > canvas.width + 50) d.x = -50;
    if (d.y < -50) d.y = canvas.height + 50;
    if (d.y > canvas.height + 50) d.y = -50;
  }
}

// draw with additive blending + glow
function drawDots() {
  // clear normally
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // additive blending makes overlaps brighter
  ctx.globalCompositeOperation = 'lighter';

  // shared shadow/glow for all dots (can be per-dot if you want variation)
  ctx.shadowBlur = SETTINGS.glowByLevel[intensity];
  ctx.shadowColor = 'rgba(255, 220, 185, 0.7)';

  for (let d of dots) {
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2); // full circle
    ctx.fillStyle = d.color;
    ctx.fill();
    ctx.closePath();
  }

  // reset composite so other drawings are unaffected if you draw later
  ctx.globalCompositeOperation = 'source-over';
  ctx.shadowBlur = 0;
}

// animation loop
function animate() {
  requestAnimationFrame(animate);
  updateDots();
  drawDots();
}

// public function to set intensity: 0 (low) .. 5 (max)
function setIntensity(level) {
  level = Math.max(0, Math.min(5, Math.round(level)));
  intensity = level;

  // compute new target count
  const target = Math.round(SETTINGS.baseCount * SETTINGS.densityMultiplier[intensity]);
  adjustDotCount(target);

  // optionally tweak existing dots' sizes/speeds
  for (let d of dots) {
    // gently rescale existing dots so change doesn't look jarring
    const maxR = SETTINGS.maxRadiusByLevel[intensity];
    d.radius = Math.min(d.radius, maxR) + Math.random() * (maxR / 3);
    const speedMult = SETTINGS.speedMultiplier[intensity];
    d.vx = Math.sign(d.vx || 1) * (Math.random() * 0.6 + 0.4) * (0.6 + speedMult);
    d.vy = Math.sign(d.vy || 1) * (Math.random() * 0.6 + 0.4) * (0.6 + speedMult);
    const colorAlpha = SETTINGS.alphaByLevel[intensity];
    d.color = `rgba(241, 229, 145, ${colorAlpha})`;
  }
}

// initial setup: create a reasonable number of dots for default intensity
adjustDotCount(Math.round(SETTINGS.baseCount * SETTINGS.densityMultiplier[intensity]));

// start
animate();

/* Example usages:
   setIntensity(0); // low
   setIntensity(2); // default
   setIntensity(4); // strong glow/density
   setIntensity(5); // maximum intensity
*/

// optional: expose to global for quick testing in console
window.setIntensity = setIntensity;