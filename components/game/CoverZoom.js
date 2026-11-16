import { useEffect, useRef, useState } from "react";
import { ZOOM_LEVELS } from "../../lib/rules";
import styles from "../../styles/game.module.css";

// The cover is drawn onto a canvas as a crop of the full image. `step` picks
// how far in the crop is; `revealed` shows the whole cover. Moving between
// levels glides rather than jumping.
const CANVAS_W = 528;
const CANVAS_H = 704; // 3:4, like the IGDB covers
const GLIDE_MS = 600;

// Covers are stored at IGDB's small size (264px wide). Zooming in 14x needs a
// much bigger source, so try the 1080p version first, then 720p, then the
// stored one.
const candidates = (url) => [
  url.replace("/t_cover_big/", "/t_1080p/"),
  url.replace("/t_cover_big/", "/t_720p/"),
  url,
];

function drawCrop(canvas, image, zoom, focus) {
  const ctx = canvas.getContext("2d");
  const base = Math.max(CANVAS_W / image.naturalWidth, CANVAS_H / image.naturalHeight);
  const sw = CANVAS_W / (base * zoom);
  const sh = CANVAS_H / (base * zoom);
  const sx = Math.min(Math.max(focus[0] * image.naturalWidth - sw / 2, 0), image.naturalWidth - sw);
  const sy = Math.min(Math.max(focus[1] * image.naturalHeight - sh / 2, 0), image.naturalHeight - sh);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, CANVAS_W, CANVAS_H);
}

export default function CoverZoom({ src, step, revealed, focus = [0.5, 0.48], label, onPalette, onLoaded }) {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const zoomRef = useRef(null); // zoom currently on screen
  const frameRef = useRef(0);
  const [ready, setReady] = useState(false);

  const targetZoom = revealed ? 1 : ZOOM_LEVELS[Math.min(step, ZOOM_LEVELS.length - 1)];

  // Load the image once per cover.
  useEffect(() => {
    let cancelled = false;
    setReady(false);
    imageRef.current = null;
    zoomRef.current = null;

    const load = (urls) => {
      const [url, ...fallbacks] = urls;
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => {
        if (cancelled) return;
        imageRef.current = image;
        setReady(true);
        onLoaded?.();
        if (onPalette) {
          import("colorthief")
            .then(({ default: ColorThief }) => {
              const colors = new ColorThief().getPalette(image, 2);
              if (!cancelled) onPalette(colors.map(([r, g, b]) => `rgb(${r}, ${g}, ${b})`));
            })
            .catch((error) => console.warn("Colour extraction failed:", error));
        }
      };
      image.onerror = () => {
        if (cancelled) return;
        if (fallbacks.length) load(fallbacks);
        else onLoaded?.();
      };
      image.src = url;
    };

    load(candidates(src));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  // Glide to the target zoom whenever it changes.
  useEffect(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!ready || !canvas || !image) return undefined;

    cancelAnimationFrame(frameRef.current);
    const from = zoomRef.current ?? targetZoom;
    if (from === targetZoom) {
      drawCrop(canvas, image, targetZoom, focus);
      zoomRef.current = targetZoom;
      return undefined;
    }

    const started = performance.now();
    const tick = (now) => {
      const t = Math.min((now - started) / GLIDE_MS, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      // Interpolate in log space so each step feels the same size.
      const zoom = from * Math.pow(targetZoom / from, eased);
      drawCrop(canvas, image, zoom, focus);
      zoomRef.current = zoom;
      if (t < 1) frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, targetZoom]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_W}
      height={CANVAS_H}
      className={`${styles.canvas} ${ready ? styles.canvasReady : ""}`}
      role="img"
      aria-label={label}
    />
  );
}
