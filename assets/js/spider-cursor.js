/**
 * Spider Cursor Effect
 * Draws animated silk-web threads from anchor points to the mouse cursor
 * with spring physics for a natural, organic feel.
 */
(function () {
  'use strict';

  // ─── Config ────────────────────────────────────────────────────────────────
  const CONFIG = {
    numAnchors: 18,          // how many web anchor points
    threadColor: 'rgba(255, 255, 255, 0.18)',
    threadGlowColor: 'rgba(200, 210, 230, 0.08)',
    highlightColor: 'rgba(255, 255, 255, 0.55)',
    maxDistance: 380,        // threads only draw within this radius from cursor
    springStrength: 0.065,   // how fast the spider dot follows cursor
    friction: 0.82,          // damping (0 = instant, 1 = no stop)
    lineWidth: 0.9,
    glowLineWidth: 5,
    dotRadius: 3,
    dotGlow: 12,
    idleWander: true,        // anchors drift slightly when idle
    fps: 60,
  };

  // ─── Canvas Setup ──────────────────────────────────────────────────────────
  const canvas = document.createElement('canvas');
  canvas.id = 'spider-canvas';
  canvas.style.cssText = [
    'position:fixed',
    'top:0',
    'left:0',
    'width:100%',
    'height:100%',
    'pointer-events:none',
    'z-index:9999',
    'mix-blend-mode:screen',
  ].join(';');
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let W = 0, H = 0;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    initAnchors();
  }
  window.addEventListener('resize', resize);

  // ─── Spider body (follows cursor with spring) ──────────────────────────────
  const spider = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    vx: 0,
    vy: 0,
  };

  let mouse = { x: spider.x, y: spider.y };
  let isMouseOnPage = false;

  document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    isMouseOnPage = true;
  });
  document.addEventListener('mouseleave', () => { isMouseOnPage = false; });

  // ─── Anchor points ────────────────────────────────────────────────────────
  let anchors = [];

  function randomEdgePoint() {
    // Anchors live near viewport edges + interior corners so web looks natural
    const side = Math.floor(Math.random() * 4);
    let x, y;
    const margin = 0.12;
    switch (side) {
      case 0: x = Math.random() * W; y = Math.random() * H * margin; break;
      case 1: x = Math.random() * W; y = H - Math.random() * H * margin; break;
      case 2: x = Math.random() * W * margin; y = Math.random() * H; break;
      case 3: x = W - Math.random() * W * margin; y = Math.random() * H; break;
    }
    return { x, y };
  }

  function initAnchors() {
    anchors = [];
    for (let i = 0; i < CONFIG.numAnchors; i++) {
      const p = randomEdgePoint();
      anchors.push({
        x: p.x,
        y: p.y,
        baseX: p.x,
        baseY: p.y,
        wanderAngle: Math.random() * Math.PI * 2,
        wanderSpeed: 0.003 + Math.random() * 0.004,
        wanderRadius: 8 + Math.random() * 18,
      });
    }
  }

  // ─── Drawing helpers ───────────────────────────────────────────────────────
  function drawThread(x1, y1, x2, y2, alpha) {
    if (alpha <= 0) return;

    // Glow pass
    ctx.save();
    ctx.globalAlpha = alpha * 0.4;
    ctx.strokeStyle = CONFIG.threadGlowColor;
    ctx.lineWidth = CONFIG.glowLineWidth;
    ctx.shadowColor = 'rgba(180, 200, 255, 0.3)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(x1, y1);

    // Slight mid-point sag for a natural silk droop
    const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * 4;
    const my = (y1 + y2) / 2 + Math.abs(x2 - x1) * 0.04;
    ctx.quadraticCurveTo(mx, my, x2, y2);
    ctx.stroke();
    ctx.restore();

    // Fine thread
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = CONFIG.threadColor;
    ctx.lineWidth = CONFIG.lineWidth;
    ctx.shadowColor = 'rgba(220, 230, 255, 0.6)';
    ctx.shadowBlur = 3;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(mx, my, x2, y2);
    ctx.stroke();
    ctx.restore();
  }

  function drawSpiderDot(x, y) {
    // Outer glow
    const grad = ctx.createRadialGradient(x, y, 0, x, y, CONFIG.dotGlow);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    grad.addColorStop(0.4, 'rgba(200, 210, 255, 0.4)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, CONFIG.dotGlow, 0, Math.PI * 2);
    ctx.fill();

    // Core dot
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(180, 200, 255, 0.9)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(x, y, CONFIG.dotRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ─── Animation loop ────────────────────────────────────────────────────────
  let lastTime = 0;
  const targetDt = 1000 / CONFIG.fps;

  function animate(now) {
    requestAnimationFrame(animate);
    if (now - lastTime < targetDt - 1) return;
    lastTime = now;

    ctx.clearRect(0, 0, W, H);

    // Spring physics: spider follows cursor
    const tx = isMouseOnPage ? mouse.x : W / 2;
    const ty = isMouseOnPage ? mouse.y : H / 2;
    spider.vx += (tx - spider.x) * CONFIG.springStrength;
    spider.vy += (ty - spider.y) * CONFIG.springStrength;
    spider.vx *= CONFIG.friction;
    spider.vy *= CONFIG.friction;
    spider.x += spider.vx;
    spider.y += spider.vy;

    // Draw threads from each anchor to spider position
    anchors.forEach((a) => {
      // Wander drift for idle anchors
      if (CONFIG.idleWander) {
        a.wanderAngle += a.wanderSpeed;
        a.x = a.baseX + Math.cos(a.wanderAngle) * a.wanderRadius;
        a.y = a.baseY + Math.sin(a.wanderAngle) * a.wanderRadius;
      }

      const dx = spider.x - a.x;
      const dy = spider.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < CONFIG.maxDistance) {
        // Fade out based on distance
        const alpha = Math.pow(1 - dist / CONFIG.maxDistance, 1.5);
        drawThread(a.x, a.y, spider.x, spider.y, alpha);
      }
    });

    // Draw the spider body dot at cursor
    drawSpiderDot(spider.x, spider.y);
  }

  // ─── Boot ──────────────────────────────────────────────────────────────────
  resize();
  requestAnimationFrame(animate);
})();
