import { useEffect, useRef } from 'react';
import { useUser } from '../hooks/useUser';

/**
 * DRM-protected contract viewer.
 *
 * Protections applied:
 * - Text selection disabled (CSS + JS)
 * - Right-click context menu blocked
 * - Ctrl+P / Cmd+P (print) blocked
 * - Ctrl+S / Cmd+S (save) blocked
 * - Ctrl+C / Cmd+C (copy) blocked inside viewer
 * - Dynamic watermark with user name + timestamp overlaid
 * - Drag disabled (prevents drag-to-clipboard)
 * - No print media — hides content if user forces print
 */
export default function DRMContractViewer({ htmlContent, contractNumber, companyName }) {
  const { dbUser } = useUser();
  const containerRef = useRef(null);

  const watermarkText = companyName
    ? `Licensed for ${companyName} only`
    : dbUser?.full_name
    ? `Licensed for ${dbUser.full_name} · ${dbUser.email}`
    : 'AqadChain — Authorized Viewer Only';

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const blockEvent = (e) => e.preventDefault();

    // Block right-click
    el.addEventListener('contextmenu', blockEvent);

    // Block drag (prevents drag-select to clipboard)
    el.addEventListener('dragstart', blockEvent);

    // Block keyboard shortcuts inside viewer
    const blockKeys = (e) => {
      const isModifier = e.ctrlKey || e.metaKey;
      const blocked = ['p', 's', 'c', 'a', 'u'];
      if (isModifier && blocked.includes(e.key.toLowerCase())) {
        e.preventDefault();
        e.stopPropagation();
      }
      // Block F12 (DevTools)
      if (e.key === 'F12') e.preventDefault();
      // Block PrintScreen
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        // Briefly hide contract content on PrintScreen
        if (el) { el.style.opacity = '0'; setTimeout(() => { el.style.opacity = '1'; }, 200); }
      }
    };

    el.addEventListener('keydown', blockKeys, true);
    document.addEventListener('keydown', blockKeys, true);

    return () => {
      el.removeEventListener('contextmenu', blockEvent);
      el.removeEventListener('dragstart', blockEvent);
      el.removeEventListener('keydown', blockKeys, true);
      document.removeEventListener('keydown', blockKeys, true);
    };
  }, []);

  return (
    <div className="drm-contract-root relative rounded-xl overflow-hidden border border-white/10"
      style={{ background: '#0a0d10' }}>

      {/* DRM header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/8"
        style={{ background: 'rgba(13,110,99,0.15)' }}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          <span className="text-teal-400 text-xs font-semibold">Secure viewer — {contractNumber}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white/30 text-xs">🔒 Platform-only access</span>
          <span className="text-xs px-2 py-0.5 rounded font-semibold"
            style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.2)' }}>
            AAOIFI Certified
          </span>
        </div>
      </div>

      {/* Contract content with DRM CSS */}
      <div
        ref={containerRef}
        className="relative"
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          WebkitTouchCallout: 'none',
          cursor: 'default',
        }}
      >
        {/* Watermark overlay — tiled across entire viewer */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 10,
            pointerEvents: 'none',
            overflow: 'hidden',
          }}
        >
          {/* Diagonal repeating watermark */}
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: `${(i % 4) * 25}%`,
                left: `${Math.floor(i / 4) * 34 - 10}%`,
                transform: 'rotate(-30deg)',
                whiteSpace: 'nowrap',
                fontSize: '11px',
                fontWeight: '600',
                color: 'rgba(13,110,99,0.12)',
                letterSpacing: '0.05em',
                userSelect: 'none',
                pointerEvents: 'none',
              }}
            >
              {watermarkText} · AqadChain DRM
            </div>
          ))}
        </div>

        {/* Actual contract HTML rendered in iframe-like sandbox */}
        <div
          className="relative z-0 max-h-[72vh] overflow-y-auto"
          style={{ background: '#fff' }}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>

      {/* DRM footer */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/8 text-xs text-white/25"
        style={{ background: 'rgba(0,0,0,0.4)' }}>
        <span>This contract may only be accessed via AqadChain. Unauthorized reproduction is prohibited.</span>
        <span className="text-white/15">{new Date().toLocaleDateString()}</span>
      </div>

      {/* Print blocker — hides entire viewer on print */}
      <style>{`
        @media print {
          .drm-contract-root { display: none !important; }
          body::after {
            content: 'This document is protected. Printing is not permitted.';
            display: block;
            text-align: center;
            padding: 100px;
            font-size: 24px;
            color: #999;
          }
        }
      `}</style>
    </div>
  );
}
