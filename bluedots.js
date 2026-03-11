(() => {
  // ====== SETTINGS ======
  const SETTINGS = {
    baseCount: 50,
    densityMultiplier: [0.2, 0.5, 1, 1.6, 2.6, 4.0],
    maxRadiusByLevel: [1, 2, 3.5, 5, 7, 10],
    glowByLevel: [0, 3, 5, 7, 10, 14],
    alphaByLevel: [0.6, 0.75, 0.9, 0.95, 0.98, 1.0],
    fps: 40
  };

  // ====== DOM & CONTEXT ======
  const id = 'canvas';
  let canvas = document.getElementById(id);
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = id;
    canvas.style.display = 'block';
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.zIndex = '-1';
    document.body.appendChild(canvas);
  }
  const ctx = canvas.getContext('2d', { alpha: true });

  // ====== STATE ======
  let dpr = Math.max(1, window.devicePixelRatio || 1);
  let intensity = 2; // 0..5
  let dots = [];
  // spriteCache is a Map keyed by `${colorKey}|${radius}|${glow}|${dpr}`
  let spriteCache = new Map();
  let lastTime = 0;
  const FRAME_DELAY = 1000 / SETTINGS.fps;

  // ====== UTIL ======
  const rand = (a, b) => Math.random() * (b - a) + a;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const toColorKey = (r, g, b) => `${r},${g},${b}`;
  const pickColor = () => {
    // more vibrant random colors
    const r = Math.round(rand(100, 255));
    const g = Math.round(rand(100, 255));
    const b = Math.round(rand(100, 255));
    return {
      rgba: `rgba(${r},${g},${b},1)`,
      key: toColorKey(r, g, b),
      r, g, b
    };
  };

  // ====== CANVAS RESIZE (debounced) ======
  let resizeTimer = null;
  function resizeCanvasImmediate() {
    dpr = Math.max(1, window.devicePixelRatio || 1);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // scale drawing to CSS pixels
    // clear cache when DPR changes or canvas size changes
    spriteCache.clear();
  }
  function resizeCanvas() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resizeCanvasImmediate();
      ensureCount();
    }, 110);
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvasImmediate();

  // ====== SPRITE CREATION (cached) ======
  function makeColoredSprite(maxRadius, glow, colorObj) {
    // colorObj has {r,g,b,rgba,key}
    const padding = Math.ceil(glow) + 2;
    const sizeCss = Math.ceil((maxRadius + glow) * 2 + padding * 2);
    const size = sizeCss * dpr;
    const s = document.createElement('canvas');
    s.width = size;
    s.height = size;
    const sc = s.getContext('2d');

    const cx = size / 2;
    const cy = size / 2;
    const outer = (maxRadius + glow) * dpr;

    // build the gradient using the dot color
    const innerColor = `rgba(${colorObj.r},${colorObj.g},${colorObj.b},1)`;
    const midColor = `rgba(${colorObj.r},${colorObj.g},${colorObj.b},0.75)`;
    const outerColor = `rgba(${colorObj.r},${colorObj.g},${colorObj.b},0)`;
    const grad = sc.createRadialGradient(cx, cy, 0, cx, cy, outer);
    grad.addColorStop(0, innerColor);
    grad.addColorStop(0.45, midColor);
    grad.addColorStop(1, outerColor);

    sc.fillStyle = grad;
    sc.beginPath();
    sc.arc(cx, cy, outer, 0, Math.PI * 2);
    sc.fill();

    return s;
  }

  // ====== DOTS ======
  function createDot() {
    const maxR = SETTINGS.maxRadiusByLevel[intensity];
    const r = rand(1, maxR);
    const speedMult = 0.4 + (SETTINGS.maxRadiusByLevel[intensity] / 6);
    const colorObj = pickColor();
    dots.push({
      x: rand(0, canvas.width / dpr),
      y: rand(0, canvas.height / dpr),
      radius: r,
      vx: rand(-1, 1) * speedMult,
      vy: rand(-1, 1) * speedMult,
      color: colorObj.rgba,
      colorKey: colorObj.key,
      colorObj
    });
  }

  function ensureCount() {
    const target = Math.round(SETTINGS.baseCount * SETTINGS.densityMultiplier[intensity]);
    while (dots.length < target) createDot();
    while (dots.length > target) dots.pop();
  }

  // ====== UPDATE ======
  function updateDots(dt) {
    for (let d of dots) {
      d.x += d.vx * (dt / (1000 / 60));
      d.y += d.vy * (dt / (1000 / 60));
      if (d.x < -50) d.x = canvas.width / dpr + 50;
      if (d.x > canvas.width / dpr + 50) d.x = -50;
      if (d.y < -50) d.y = canvas.height / dpr + 50;
      if (d.y > canvas.height / dpr + 50) d.y = -50;
    }
  }

  // ====== DRAW ======
  function drawDots() {
    // Clear in CSS pixels space
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    const glow = SETTINGS.glowByLevel[intensity];
    const alpha = SETTINGS.alphaByLevel[intensity];

    for (let d of dots) {
      const drawSize = (d.radius + glow) * 2;
      const px = d.x - drawSize / 2;
      const py = d.y - drawSize / 2;

      // subtle base color to tint the sprite (keeps small core visible)
      ctx.globalAlpha = 0.08;
      ctx.beginPath();
      ctx.fillStyle = d.color;
      ctx.arc(d.x, d.y, Math.max(1, d.radius * 0.85), 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();

      // draw the glow sprite (cached per-color+radius+glow+dpr)
      const key = `${d.colorKey}|${Math.round(d.radius)}|${glow}|${dpr}`;
      let sprite = spriteCache.get(key);
      if (!sprite) {
        // create and cache
        const maxR = Math.max(1, d.radius);
        sprite = makeColoredSprite(maxR, glow, d.colorObj);
        spriteCache.set(key, sprite);
      }

      ctx.globalAlpha = alpha;
      // drawImage scales sprite (sprite is at DPR); center it properly
      ctx.drawImage(
        sprite,
        px - (drawSize * dpr - drawSize) / 2,
        py - (drawSize * dpr - drawSize) / 2,
        drawSize * dpr,
        drawSize * dpr
      );
    }

    ctx.restore();
  }

  // ====== ANIMATION LOOP (FPS cap) ======
  function loop(time = 0) {
    requestAnimationFrame(loop);
    if (!lastTime) lastTime = time;
    const dt = time - lastTime;
    if (dt < FRAME_DELAY) return;
    lastTime = time;

    updateDots(dt || FRAME_DELAY);
    drawDots();
  }

  // ====== PUBLIC API: setIntensity ======
  function setIntensity(level) {
    level = Math.round(clamp(level, 0, 5));
    if (level === intensity) return;
    intensity = level;
    spriteCache.clear();
    // tweak existing dots sizes so change looks smooth
    for (let d of dots) {
      const maxR = SETTINGS.maxRadiusByLevel[intensity];
      d.radius = Math.min(d.radius, maxR) + Math.random() * (maxR * 0.25);
    }
    ensureCount();
  }

  // Expose to window for quick testing
  window.setIntensity = setIntensity;

  // ====== START ======
  ensureCount();
  loop();

  // initial resize to ensure canvas is sized properly if script loaded after DOM ready
  resizeCanvasImmediate();
})();