// ---- Gauge configuration ---------------------------------------------------

// Score boundaries shown around the arc.
const BOUNDARIES = [300, 560, 640, 700, 775, 850];

const COLORS = [
  "#ff2a1c", // rojo intenso
  "#ff3b30", // rojo
  "#ff6a00", // naranja rojizo
  "#ffb300", // amarillo oscuro
  "#84d600", // verde amarillento
  "#00c853"  // verde
];

// Label color per boundary.
const LABEL_COLORS = ["#ff3b30", "#ff8a00", "#ffd400", "#a8e02a", "#34c759", "#34c759"];

const START_DEG = 145; // angle (canvas, clockwise from +x) of the "300" end
const SWEEP_DEG = 250; // total sweep of the arc
const GAP_DEG = 4 // gap between colored segments
const SEGMENTS = BOUNDARIES.length - 1;

// ---- Helpers ---------------------------------------------------------------

function hexToRgb(h) {
  h = h.replace("#", "");
  return [
    parseInt(h.substr(0, 2), 16),
    parseInt(h.substr(2, 2), 16),
    parseInt(h.substr(4, 2), 16),
  ];
}

function lerpColor(a, b, t) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  const r = Math.round(A[0] + (B[0] - A[0]) * t);
  const g = Math.round(A[1] + (B[1] - A[1]) * t);
  const bl = Math.round(A[2] + (B[2] - A[2]) * t);
  return `rgb(${r},${g},${bl})`;
}

function deg2rad(d) {
  return (d * Math.PI) / 180;
}

// Map a score to a fraction (0..1) along the arc using equal-sized segments.
function valueToFraction(value) {
  const min = BOUNDARIES[0];
  const max = BOUNDARIES[BOUNDARIES.length - 1];

  return (value - min) / (max - min);
}

function pointAt(cx, cy, r, deg) {
  const a = deg2rad(deg);
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

// ---- Drawing ---------------------------------------------------------------

function drawArcSegment(ctx, cx, cy, r, lw, a0, a1, c0, c1) {
  const steps = 26;
  ctx.lineCap = "butt";
  ctx.lineWidth = lw;
  for (let i = 0; i < steps; i++) {
    const f0 = i / steps;
    const f1 = (i + 1) / steps;
    const A0 = deg2rad(a0 + (a1 - a0) * f0);
    const A1 = deg2rad(a0 + (a1 - a0) * f1);
    const col = lerpColor(c0, c1, (f0 + f1) / 2);
    ctx.beginPath();
    ctx.strokeStyle = col;
    ctx.shadowColor = col;
    ctx.shadowBlur = lw * 0.2; // Variacion del desenfoque para un efecto más suave
    ctx.arc(cx, cy, r, A0, A1 + 0.012);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
}

function drawGauge(canvas, scoreOverride = null, startScore = null) {
  const score =
    scoreOverride !== null
      ? Math.round(scoreOverride)
      : parseInt(canvas.dataset.score, 10);
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.clientWidth;
  const H = canvas.clientHeight;

  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);

  const cx = W / 2;
  const cy = H * 0.52;
  const r = W * 0.305;
  const lw = r * 0.17;

  // Colored arc segments.
  for (let i = 0; i < SEGMENTS; i++) {
    const a0 = START_DEG + (i / SEGMENTS) * SWEEP_DEG + GAP_DEG / 2;
    const a1 = START_DEG + ((i + 1) / SEGMENTS) * SWEEP_DEG - GAP_DEG / 2;
    drawArcSegment(ctx, cx, cy, r, lw, a0, a1, COLORS[i], COLORS[i + 1]);
  }

  // Boundary labels.
  const labelR = r + lw * 0.75 + 18;
  ctx.font = "600 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = 0; i < BOUNDARIES.length; i++) {
    const t = valueToFraction(BOUNDARIES[i]);
    const deg = START_DEG + t * SWEEP_DEG;
    const [lx, ly] = pointAt(cx, cy, labelR, deg);
    ctx.fillStyle = LABEL_COLORS[i];
    ctx.fillText(String(BOUNDARIES[i]), lx, ly);
  }

  // Needle.
  const t = valueToFraction(Math.max(BOUNDARIES[0], Math.min(BOUNDARIES[BOUNDARIES.length - 1], score)));
  const ang = deg2rad(START_DEG + t * SWEEP_DEG);
  const L = r * 0.86;
  const tipx = cx + L * Math.cos(ang);
  const tipy = cy + L * Math.sin(ang);
  const w = lw * 0.5;
  const perp = ang + Math.PI / 2;
  const b1x = cx + w * Math.cos(perp);
  const b1y = cy + w * Math.sin(perp);
  const b2x = cx - w * Math.cos(perp);
  const b2y = cy - w * Math.sin(perp);

  const grad = ctx.createLinearGradient(cx, cy, tipx, tipy);
  grad.addColorStop(0, "#000000");
  grad.addColorStop(0.5, "#1d1d1d");
  grad.addColorStop(1, "#7e7e7e");

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 2;
  ctx.beginPath();
  ctx.moveTo(b1x, b1y);
  ctx.lineTo(tipx, tipy);
  ctx.lineTo(b2x, b2y);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.restore();

  // Hub.
  ctx.beginPath();
  ctx.arc(cx, cy, w * 0.85, 0, Math.PI * 2);
  ctx.fillStyle = "#3a3a3a";
  ctx.fill();

  // Center score.
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffffff";
  ctx.font = `700 ${Math.round(r * 0.52)}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
  ctx.fillText(String(score), cx, cy - r * 0.04);

  let status = "POOR";
  let statusColor = "#ff3b30";

  if (score >= 750) {
    status = "ECELLENT";
    statusColor = "#34c759";
  } else if (score >= 700) {
    status = "GOOD";
    statusColor = "#34c759";
  } else if (score >= 650) {
    status = "FAIR";
    statusColor = "#ffb300";
  }

  // Incremento del score
  if (startScore !== null) {
    const increase = Math.max(0, Math.round(score - startScore));

    if(increase > 0) {
      ctx.fillStyle = "#34c759";
      ctx.font = "700 25px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.textAlign = "center";

      ctx.fillText(
        `+${increase}`,
        cx,
        H - 85 // separación inferior
      );
    }
  }

  ctx.fillStyle = statusColor;
  ctx.font = `700 ${Math.round(r * 0.16)}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
  ctx.fillText(status, cx, cy + r * 0.36);
}

const START_SCORES = [556, 547, 541];
const END_SCORES = [793, 803, 789];

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function renderScrollAnimation() {
  const gauges = document.querySelectorAll("canvas.h-gauge");

  // 300dvh = 3 veces la altura visible
  const animationDistance = window.innerHeight * 1.8;

  const progress = Math.min(
    1,
    Math.max(0, window.scrollY / animationDistance)
  );

  gauges.forEach((gauge, index) => {
    const score = lerp(
      START_SCORES[index],
      END_SCORES[index],
      progress
    );

    drawGauge(gauge, score, START_SCORES[index]);
  });
}

window.addEventListener("load", () => {
  renderScrollAnimation();
});

window.addEventListener("resize", () => {
  renderScrollAnimation();
});

window.addEventListener("scroll", () => {
  requestAnimationFrame(renderScrollAnimation);
});