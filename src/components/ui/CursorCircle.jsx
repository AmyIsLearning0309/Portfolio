import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import '../../styles/cursor-circle.css';

const INTERACTIVE =
  'a, button, [role="button"], input, textarea, select, label, summary, [data-cursor-label]';

/** Siemens cursor teal — matches progress bar / accents */
const SIEMENS_TEAL = { r: 49, g: 205, b: 199 }; // #31CDC7
const TEAL_DIST_SQ = 110 * 110;

/** When canvas sampling fails, force white over known teal media */
const TEAL_FALLBACK_SEL =
  '.pd-hero-img, .sd-journey-figure img, .sd-hscroll__item img, .sd-hscroll__progress-bar';

/** Follow tightness — higher = snappier (was 0.12, felt laggy) */
const FOLLOW_LERP = 0.42;
/** Sample contrast every N frames to keep the RAF loop light */
const CONTRAST_SAMPLE_EVERY = 3;

/** WCAG relative luminance — 0 (black) → 1 (white) */
const relativeLuminance = ({ r, g, b }) => {
  const lin = [r, g, b].map((c) => {
    const n = c / 255;
    return n <= 0.03928 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
};

/**
 * Circle cursor → rounded square on clickables,
 * or a black info pill when the target has data-cursor-label.
 * Siemens: teal cursor, white over similar teal fills.
 * Homepage: dark cursor, white over dark backgrounds / thumbnails.
 */
export default function CursorCircle() {
  const ringRef = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const rafRef = useRef(0);
  const contrastPageRef = useRef(null); // 'siemens' | 'home' | null
  const invertRef = useRef(false);
  const hoveringRef = useRef(false);
  const labelRef = useRef('');
  const visibleRef = useRef(false);
  const frameRef = useRef(0);
  const sampleCache = useRef(new Map()); // img src → { canvas, ctx, w, h }
  const [enabled, setEnabled] = useState(false);
  const [invert, setInvert] = useState(false);
  const { pathname } = useLocation();
  const isSiemens = pathname === '/work/siemens';
  const isHome = pathname === '/';
  contrastPageRef.current = isSiemens ? 'siemens' : isHome ? 'home' : null;

  useEffect(() => {
    if (!contrastPageRef.current && invertRef.current) {
      invertRef.current = false;
      setInvert(false);
    }
  }, [pathname]);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const noReduce = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || !noReduce) return undefined;

    setEnabled(true);
    document.documentElement.classList.add('has-circle-cursor');

    const readLabel = (el) => {
      if (!el) return '';
      const labeled = el.closest?.('[data-cursor-label]');
      return labeled?.getAttribute('data-cursor-label')?.trim() || '';
    };

    const syncClasses = () => {
      const el = ringRef.current;
      if (!el) return;
      el.classList.toggle('is-visible', visibleRef.current);
      el.classList.toggle('is-hover', hoveringRef.current);
      el.classList.toggle('is-pill', Boolean(labelRef.current));
      const pill = el.querySelector('.cursor-circle__pill');
      if (pill && pill.textContent !== labelRef.current) {
        pill.textContent = labelRef.current;
      }
    };

    const setHoverState = (nextHover, nextLabel) => {
      if (hoveringRef.current === nextHover && labelRef.current === nextLabel) return;
      hoveringRef.current = nextHover;
      labelRef.current = nextLabel;
      syncClasses();
    };

    const parseRgb = (css) => {
      if (!css || css === 'transparent' || css === 'rgba(0, 0, 0, 0)') return null;
      const m = css.match(
        /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/,
      );
      if (!m) return null;
      const a = m[4] !== undefined ? Number(m[4]) : 1;
      if (a < 0.15) return null;
      return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]) };
    };

    const distSq = (a, b) => {
      const dr = a.r - b.r;
      const dg = a.g - b.g;
      const db = a.b - b.b;
      return dr * dr + dg * dg + db * db;
    };

    const rgbToHsl = ({ r, g, b }) => {
      const rn = r / 255;
      const gn = g / 255;
      const bn = b / 255;
      const max = Math.max(rn, gn, bn);
      const min = Math.min(rn, gn, bn);
      const l = (max + min) / 2;
      if (max === min) return { h: 0, s: 0, l };
      const d = max - min;
      const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      let h;
      switch (max) {
        case rn:
          h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
          break;
        case gn:
          h = ((bn - rn) / d + 2) / 6;
          break;
        default:
          h = ((rn - gn) / d + 4) / 6;
      }
      return { h: h * 360, s, l };
    };

    const isTealLike = (rgb) => {
      if (!rgb) return false;
      if (distSq(rgb, SIEMENS_TEAL) <= TEAL_DIST_SQ) return true;
      const { h, s, l } = rgbToHsl(rgb);
      return s > 0.32 && l > 0.22 && l < 0.78 && h >= 150 && h <= 200;
    };

    const sampleImagePixel = (img, clientX, clientY) => {
      if (!img.complete || !img.naturalWidth) return null;
      const rect = img.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return null;
      const lx = clientX - rect.left;
      const ly = clientY - rect.top;
      if (lx < 0 || ly < 0 || lx > rect.width || ly > rect.height) return null;

      const nx = Math.min(
        img.naturalWidth - 1,
        Math.max(0, Math.floor((lx / rect.width) * img.naturalWidth)),
      );
      const ny = Math.min(
        img.naturalHeight - 1,
        Math.max(0, Math.floor((ly / rect.height) * img.naturalHeight)),
      );

      const src = img.currentSrc || img.src;
      let entry = sampleCache.current.get(src);
      try {
        if (!entry || entry.w !== img.naturalWidth || entry.h !== img.naturalHeight) {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) return null;
          ctx.drawImage(img, 0, 0);
          entry = { canvas, ctx, w: img.naturalWidth, h: img.naturalHeight };
          sampleCache.current.set(src, entry);
        }
        const data = entry.ctx.getImageData(nx, ny, 1, 1).data;
        if (data[3] < 40) return null;
        return { r: data[0], g: data[1], b: data[2] };
      } catch {
        sampleCache.current.delete(src);
        return null;
      }
    };

    const sampleBgUnder = (el) => {
      let node = el;
      while (node && node !== document.documentElement) {
        if (node.nodeType === 1) {
          const bg = parseRgb(getComputedStyle(node).backgroundColor);
          if (bg) return bg;
        }
        node = node.parentElement;
      }
      return parseRgb(getComputedStyle(document.body).backgroundColor);
    };

    const sampleColorUnder = (x, y) => {
      const stack = document.elementsFromPoint?.(x, y) || [];
      const hit =
        stack.find((n) => n.nodeType === 1 && !n.closest?.('.cursor-circle')) ||
        document.elementFromPoint(x, y);
      if (!hit || hit.closest?.('.cursor-circle')) return null;

      const img =
        hit.tagName === 'IMG'
          ? hit
          : hit.querySelector?.('img') || stack.find((n) => n.tagName === 'IMG');

      if (img) {
        const px = sampleImagePixel(img, x, y);
        if (px) return px;
      }

      return sampleBgUnder(hit);
    };

    const needsLightCursor = (rgb, page) => {
      if (!rgb) return false;
      if (page === 'siemens') return isTealLike(rgb);
      if (page === 'home') {
        if (relativeLuminance(rgb) < 0.42) return true;
        if (isTealLike(rgb)) return true;
        return false;
      }
      return false;
    };

    const shouldInvertAt = (x, y, page) => {
      if (!page) return false;
      const rgb = sampleColorUnder(x, y);
      if (rgb && needsLightCursor(rgb, page)) return true;

      if (page === 'siemens') {
        const stack = document.elementsFromPoint?.(x, y) || [];
        const hit = stack.find((n) => n.nodeType === 1 && !n.closest?.('.cursor-circle'));
        if (hit?.matches?.(TEAL_FALLBACK_SEL) || hit?.closest?.(TEAL_FALLBACK_SEL)) {
          return true;
        }
      }

      return false;
    };

    const onMove = (e) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;

      if (!visibleRef.current) {
        visibleRef.current = true;
        syncClasses();
      }

      const el = e.target.closest?.(INTERACTIVE);
      if (el && !el.closest?.('.cursor-circle')) {
        setHoverState(true, readLabel(el));
      } else if (!e.target.closest?.('.cursor-circle')) {
        setHoverState(false, '');
      }
    };

    const onLeave = () => {
      visibleRef.current = false;
      hoveringRef.current = false;
      labelRef.current = '';
      syncClasses();
      if (invertRef.current) {
        invertRef.current = false;
        setInvert(false);
      }
    };

    const onOver = (e) => {
      const el = e.target.closest?.(INTERACTIVE);
      if (el && !el.closest?.('.cursor-circle')) {
        setHoverState(true, readLabel(el));
      }
    };

    const onOut = (e) => {
      const next = e.relatedTarget;
      const stillHot = next?.closest?.(INTERACTIVE);
      if (stillHot && !stillHot.closest?.('.cursor-circle')) {
        setHoverState(true, readLabel(stillHot));
      } else {
        setHoverState(false, '');
      }
    };

    const tick = () => {
      pos.current.x += (target.current.x - pos.current.x) * FOLLOW_LERP;
      pos.current.y += (target.current.y - pos.current.y) * FOLLOW_LERP;
      const el = ringRef.current;
      if (el) {
        el.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
      }

      const page = contrastPageRef.current;
      frameRef.current += 1;
      if (page && frameRef.current % CONTRAST_SAMPLE_EVERY === 0) {
        const nextInvert = shouldInvertAt(target.current.x, target.current.y, page);
        if (nextInvert !== invertRef.current) {
          invertRef.current = nextInvert;
          setInvert(nextInvert);
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    document.addEventListener('pointerover', onOver, { passive: true });
    document.addEventListener('pointerout', onOut, { passive: true });
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      document.documentElement.classList.remove('has-circle-cursor');
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('pointerout', onOut);
      cancelAnimationFrame(rafRef.current);
      sampleCache.current.clear();
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      ref={ringRef}
      className={[
        'cursor-circle',
        isSiemens ? 'cursor-circle--siemens' : '',
        invert ? 'cursor-circle--invert' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden="true"
    >
      <svg
        className="cursor-circle__svg"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="cursor-circle__ring"
          cx="10"
          cy="10"
          r="8.5"
          stroke="currentColor"
          strokeWidth="2"
        />
        <rect
          className="cursor-circle__square"
          x="1.5"
          y="1.5"
          width="17"
          height="17"
          rx="3.5"
          ry="3.5"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
      <div className="cursor-circle__pill" />
    </div>
  );
}
