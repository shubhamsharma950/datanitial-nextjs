/**
 * HeroSection.jsx
 *
 * Animation sequence (triggered by .hero--visible via IntersectionObserver):
 *   Step 1 — 0.00s  BG card fades in (empty, just background image)
 *   Step 2 — 0.80s  Short icon (favss.png) scales in from center
 *   Step 3 — 1.60s  Main logo (logo-second-1.png) slides in from left
 *   Step 4 — 2.60s  Logo stage fades out
 *   Step 5 — 2.80s  Badge slides up
 *   Step 6 — 3.10s  Heading slides up
 *   Step 7 — 3.40s  Sub-heading slides up
 *   Step 8 — 3.70s  Highlight card slides up
 *
 * Layout: left half = text content, right half = bg image (via CSS clip).
 * Mobile: bg image fills top area, content stacks below it.
 */

import { useEffect, useRef, useState } from "react";
import "./HeroSection.css";

// ── Constants ────────────────────────────────────────────────────────────────
const WP_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.NEXT_PUBLIC_WP_REST_URL) ||
  "https://darkred-worm-224502.hostingersite.com/wp-json";

const HERO_API_URL = `${WP_BASE}/datainitial/v1/hero-section`;

const DEFAULTS = {
  heading:        "OUR SCRAPING\nEXPERTISE",
  subHeading:     "Real-time data extraction, intelligence, and APIs — built for enterprises that move fast and think smarter.",
  badgeText:      "Harness The Full Potential Of Data With",
  badgeIconUrl:   "https://darkred-worm-224502.hostingersite.com/wp-content/uploads/2026/04/star.png",
  logoIconUrl:    "https://darkred-worm-224502.hostingersite.com/wp-content/uploads/2026/04/favss.png",
  logoFullUrl:    "https://darkred-worm-224502.hostingersite.com/wp-content/uploads/2026/04/logo-second-1.png",
  highlightLabel: "Built",
  highlightAccent: "High-Impact",
  highlightSub:   "Use cases",
  whatsappUrl:    "https://wa.me/917490947694",
};

// ── Component ────────────────────────────────────────────────────────────────
export default function HeroSection() {
  const sectionRef = useRef(null);
  const [data, setData] = useState(DEFAULTS);

  // Fetch live data from WordPress
  useEffect(() => {
    let cancelled = false;
    fetch(HERO_API_URL)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((json) => {
        if (!cancelled) setData((prev) => ({ ...prev, ...json }));
      })
      .catch(() => {
        // Silently fall back to DEFAULTS
      });
    return () => { cancelled = true; };
  }, []);

  // Trigger entrance animation via IntersectionObserver
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        ([entry], obs) => {
          if (entry.isIntersecting) {
            el.classList.add("hero--visible");
            obs.disconnect();
          }
        },
        { threshold: 0.10 }
      );
      observer.observe(el);
      return () => observer.disconnect();
    } else {
      requestAnimationFrame(() => el.classList.add("hero--visible"));
    }
  }, []);

  const {
    heading,
    subHeading,
    badgeText,
    badgeIconUrl,
    logoIconUrl,
    logoFullUrl,
    highlightLabel,
    highlightAccent,
    highlightSub,
    whatsappUrl,
  } = data;

  const headingLines = heading ? heading.split("\n") : [];

  return (
    <section className="hero" ref={sectionRef} aria-label="Hero">

      {/* ── Logo entrance stage (overlays card during intro) ── */}
      <div className="hero__logo-stage" aria-hidden="true">
        {logoIconUrl && (
          <img
            className="hero__logo-icon"
            src={logoIconUrl}
            alt=""
            width={72}
            height={72}
            loading="eager"
            decoding="async"
          />
        )}
        {logoFullUrl && (
          <img
            className="hero__logo-full"
            src={logoFullUrl}
            alt="DataInitial"
            height={52}
            loading="eager"
            decoding="async"
          />
        )}
      </div>

      {/* ── Hero card ── */}
      <div className="hero__inner container">

        {/* Left: text content */}
        <div className="hero__left">

          {badgeText && (
            <p className="hero__badge">
              {badgeIconUrl && (
                <img
                  className="hero__badge-icon"
                  src={badgeIconUrl}
                  alt=""
                  width={20}
                  height={20}
                  loading="lazy"
                  decoding="async"
                  aria-hidden="true"
                />
              )}
              {badgeText}
            </p>
          )}

          <h1 className="hero__heading">
            {headingLines.length > 1
              ? headingLines.map((line, i) => <span key={i}>{line}</span>)
              : heading}
          </h1>

          {subHeading && (
            <p className="hero__sub">{subHeading}</p>
          )}

        </div>

        {/* Right: bg image panel (CSS handles the image) */}
        <div className="hero__image-panel" aria-hidden="true" />

        {/* "Built High-Impact" card — bottom-right corner */}
        <div className="hero__highlight-card">
          <p className="hero__highlight-text">
            {highlightLabel && (
              <span className="hero__highlight-plain">{highlightLabel} </span>
            )}
            {highlightAccent && (
              <span className="hero__highlight-accent">{highlightAccent}</span>
            )}
          </p>
          {highlightSub && (
            <p className="hero__highlight-sub">{highlightSub}</p>
          )}
        </div>

      </div>

      {/* WhatsApp FAB */}
      {whatsappUrl && (
        <a
          href={whatsappUrl}
          className="hero__wa"
          aria-label="Chat on WhatsApp"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
          </svg>
        </a>
      )}

    </section>
  );
}
