import { useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Compact Simplex Noise 2D — procedural, no external deps
// ─────────────────────────────────────────────────────────────────────────────
const grad2: [number, number][] = [
  [1, 1], [-1, 1], [1, -1], [-1, -1],
  [1, 0], [-1, 0], [0, 1], [0, -1],
];

function buildPerm() {
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  const perm = new Uint8Array(512);
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  return perm;
}

function simplex2D(perm: Uint8Array, x: number, y: number): number {
  const F2 = 0.5 * (Math.sqrt(3) - 1);
  const G2 = (3 - Math.sqrt(3)) / 6;
  const s = (x + y) * F2;
  const i = Math.floor(x + s);
  const j = Math.floor(y + s);
  const t = (i + j) * G2;
  const x0 = x - (i - t);
  const y0 = y - (j - t);
  const [i1, j1] = x0 > y0 ? [1, 0] : [0, 1];
  const x1 = x0 - i1 + G2;
  const y1 = y0 - j1 + G2;
  const x2 = x0 - 1 + 2 * G2;
  const y2 = y0 - 1 + 2 * G2;
  const ii = i & 255;
  const jj = j & 255;
  let n0 = 0, n1 = 0, n2 = 0;
  let t0 = 0.5 - x0 * x0 - y0 * y0;
  if (t0 > 0) {
    const g = grad2[perm[ii + perm[jj]] % 8];
    n0 = (t0 * t0) * (t0 * t0) * (g[0] * x0 + g[1] * y0);
  }
  let t1 = 0.5 - x1 * x1 - y1 * y1;
  if (t1 > 0) {
    const g = grad2[perm[ii + i1 + perm[jj + j1]] % 8];
    n1 = (t1 * t1) * (t1 * t1) * (g[0] * x1 + g[1] * y1);
  }
  let t2 = 0.5 - x2 * x2 - y2 * y2;
  if (t2 > 0) {
    const g = grad2[perm[ii + 1 + perm[jj + 1]] % 8];
    n2 = (t2 * t2) * (t2 * t2) * (g[0] * x2 + g[1] * y2);
  }
  return 70 * (n0 + n1 + n2); // [-1, 1]
}

// Fractal / fBm noise — octave stacking for organic texture
function fbm(perm: Uint8Array, x: number, y: number, octaves = 4): number {
  let v = 0, amp = 0.5, freq = 1, max = 0;
  for (let o = 0; o < octaves; o++) {
    v += simplex2D(perm, x * freq, y * freq) * amp;
    max += amp;
    amp *= 0.5;
    freq *= 2.1;
  }
  return v / max; // normalised [-1, 1]
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface HazeLayer {
  /** Normalised speed for noise domain travel */
  speed: number;
  /** fBm octave count */
  octaves: number;
  /** Base opacity ceiling at peak noise value */
  maxOpacity: number;
  /** Scale factor for the noise domain (larger = broader features) */
  scale: number;
  /** Noise domain offset so layers are independent */
  seedX: number;
  seedY: number;
  /** How much to darken the center region (0 = no suppression) */
  centerSuppression: number;
  /** Hex color to paint with */
  color: [number, number, number];
}

interface Particle {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  opacity: number;
  maxOpacity: number;
  fadeIn: boolean;
  life: number;
  maxLife: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
interface SmokeBackgroundProps {
  className?: string;
}

export default function SmokeBackground({ className = "" }: SmokeBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ── Noise tables (one per layer for independence) ─────────────────────
    const perm = [buildPerm(), buildPerm(), buildPerm(), buildPerm()];

    let W = 0, H = 0;
    let raf = 0;

    const resize = () => {
      W = canvas.parentElement?.offsetWidth || window.innerWidth;
      H = canvas.parentElement?.offsetHeight || window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };
    resize();
    window.addEventListener("resize", resize);

    // ── Haze Layer Definitions ────────────────────────────────────────────
    // Layer 1: Background Fog — enormous, very low opacity, imperceptibly slow
    // Layer 2: Midground Smoke — more irregular, slightly more visible
    // Layer 3: Foreground Wisps — narrow, fine tendrils
    // Layer 4: Edge Accumulation — peripheral density boost
    const layers: HazeLayer[] = [
      {
        speed: 0.00004,
        octaves: 3,
        maxOpacity: 0.03,
        scale: 0.0018,
        seedX: 0,
        seedY: 100,
        centerSuppression: 0.55,
        color: [200, 200, 200],
      },
      {
        speed: 0.00007,
        octaves: 4,
        maxOpacity: 0.03,
        scale: 0.003,
        seedX: 300,
        seedY: 50,
        centerSuppression: 0.45,
        color: [220, 220, 220],
      },
      {
        speed: 0.00012,
        octaves: 5,
        maxOpacity: 0.03,
        scale: 0.006,
        seedX: 700,
        seedY: 800,
        centerSuppression: 0.3,
        color: [210, 210, 210],
      },
      {
        speed: 0.00006,
        octaves: 3,
        maxOpacity: 0.03,
        scale: 0.0012,
        seedX: 500,
        seedY: 400,
        centerSuppression: 0.65, // heavy center clearing
        color: [180, 180, 180],
      },
    ];

    // ── Offscreen ImageData buffers (one per layer) ───────────────────────
    // We render each layer in a very low-res offscreen canvas then composite
    // for performance — avoids per-pixel main thread JS on full res.
    const SCALE_DOWN = 4; // render noise at 1/4 resolution, upscale
    let offW = 0, offH = 0;
    const offscreens: OffscreenCanvas[] = [];
    const offCtxs: OffscreenCanvasRenderingContext2D[] = [];

    const rebuildOffscreens = () => {
      offW = Math.ceil(W / SCALE_DOWN);
      offH = Math.ceil(H / SCALE_DOWN);
      offscreens.length = 0;
      offCtxs.length = 0;
      for (let i = 0; i < layers.length; i++) {
        const oc = new OffscreenCanvas(offW, offH);
        const oc2d = oc.getContext("2d")!;
        offscreens.push(oc);
        offCtxs.push(oc2d);
      }
    };
    rebuildOffscreens();
    window.addEventListener("resize", rebuildOffscreens);

    // ── Particle Pool ─────────────────────────────────────────────────────
    const isMobile = () => W < 768;
    const particleTarget = () => isMobile() ? 12 : 24;

    const makeParticle = (): Particle => ({
      x: Math.random() * W,
      y: Math.random() * H,
      size: Math.random() * 0.9 + 0.4,
      vx: (Math.random() - 0.5) * 0.08,
      vy: -(Math.random() * 0.1 + 0.02),
      opacity: 0,
      maxOpacity: Math.random() * 0.22 + 0.08,
      fadeIn: true,
      life: 0,
      maxLife: 300 + Math.random() * 400,
    });

    const particles: Particle[] = [];
    for (let i = 0; i < particleTarget(); i++) {
      const p = makeParticle();
      p.opacity = p.maxOpacity * Math.random(); // staggered start
      p.life = Math.random() * p.maxLife;
      particles.push(p);
    }

    // ── Render Loop ───────────────────────────────────────────────────────
    const startMs = performance.now();

    const frame = (now: number) => {
      const t = now - startMs;

      // 1. Clear main canvas to pure black
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, W, H);

      // 2. Render each haze layer into its offscreen buffer
      layers.forEach((layer, li) => {
        const oc = offCtxs[li];
        const imgData = oc.createImageData(offW, offH);
        const data = imgData.data;

        const domain = t * layer.speed;

        for (let py = 0; py < offH; py++) {
          for (let px = 0; px < offW; px++) {
            // Normalised screen position [0,1]
            const nx = px / offW;
            const ny = py / offH;

            // fBm sample — domain offset travels slowly over time
            const nv = fbm(
              perm[li],
              layer.seedX + nx * layer.scale * W + domain,
              layer.seedY + ny * layer.scale * H + domain * 0.7,
              layer.octaves
            );

            // nv in [-1,1]; remap to [0,1]
            let density = (nv + 1) * 0.5;

            // Boost edges / suppress center
            // Center of screen in normalised coords
            const dx = (nx - 0.5) * 2; // [-1,1]
            const dy = (ny - 0.5) * 2;
            const distFromCenter = Math.sqrt(dx * dx + dy * dy); // 0 center, ~1.4 corners

            // Edge boost: very subtle, keeps haze leaning toward periphery
            const edgeBoost = Math.max(0, (distFromCenter - 0.7) * 0.15);
            density = density + edgeBoost;

            // Center suppression: multiply density by a factor that's lowest at center
            const suppressMask = Math.min(1, distFromCenter / 0.55); // 0 at center, 1 beyond radius 0.55
            const suppressedDensity = density * (1 - layer.centerSuppression * (1 - suppressMask));

            // Apply threshold: only render above a high baseline so haze appears
            // as isolated drifting cloud patches — not a full-screen blanket.
            // Threshold 0.62 means only the top ~20% brightest noise peaks are visible.
            const clamped = Math.max(0, suppressedDensity - 0.62) * 5.0;
            const alpha = Math.min(1, clamped) * layer.maxOpacity;

            const idx = (py * offW + px) * 4;
            data[idx] = layer.color[0];
            data[idx + 1] = layer.color[1];
            data[idx + 2] = layer.color[2];
            data[idx + 3] = Math.round(alpha * 255);
          }
        }

        oc.putImageData(imgData, 0, 0);

        // Composite low-res offscreen → main canvas at full resolution
        ctx.save();
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(offscreens[li], 0, 0, W, H);
        ctx.restore();
      });

      // 3. Additional gaussian blur pass per layer using CSS filter
      // (done implicitly by upscaling low-res — natural blur from bilinear)

      // 4. Update and render micro-particles
      const pt = particleTarget();
      while (particles.length < pt) particles.push(makeParticle());

      particles.forEach((p, i) => {
        p.life++;
        p.x += p.vx + Math.sin(t * 0.0005 + i) * 0.06;
        p.y += p.vy;

        // Fade in / out lifecycle
        if (p.life < p.maxLife * 0.15) {
          p.opacity = Math.min(p.maxOpacity, p.opacity + 0.003);
        } else if (p.life > p.maxLife * 0.75) {
          p.opacity = Math.max(0, p.opacity - 0.002);
        }

        // Respawn off-screen or end of life
        if (p.y < -10 || p.life >= p.maxLife || p.x < -10 || p.x > W + 10) {
          Object.assign(p, makeParticle());
        }

        // Only render particles not in tight center zone
        const cx = Math.abs(p.x - W * 0.5) / (W * 0.5);
        const cy = Math.abs(p.y - H * 0.5) / (H * 0.5);
        const distC = Math.sqrt(cx * cx + cy * cy);
        if (distC < 0.25) return; // skip center

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,180,180,${p.opacity.toFixed(3)})`;
        ctx.fill();
      });

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("resize", rebuildOffscreens);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`block pointer-events-none ${className}`}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
