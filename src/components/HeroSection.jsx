import { useEffect, useRef } from "react";
import "./HeroSection.css";

/* ═══════════════════════════════════════════════
   HERO SECTION — Static design with animations
   Layout matches Figma/screenshot:
   - Badge text top left
   - Big bold heading (2 lines)
   - Sub-heading paragraph
   - Highlight card (right side)
   - Animated arc lines background
   - WhatsApp FAB
═══════════════════════════════════════════════ */

const WHATSAPP_URL = "https://wa.me/917490947694";

export default function HeroSection() {
  const sectionRef = useRef(null);

  /* ── Entrance animation on mount ── */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    // Trigger CSS animation by adding class after paint
    requestAnimationFrame(() => {
      el.classList.add("hero--visible");
    });
  }, []);

  return (
    <section className="hero" ref={sectionRef} aria-label="Hero">

      {/* ── Animated arc background ── */}
      <div className="hero__bg" aria-hidden="true">
        <div className="hero__arc-wrap">
          {[...Array(7)].map((_, i) => (
            <span key={i} className="hero__arc" style={{ "--i": i }} />
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="hero__inner container">

        {/* Left column */}
        <div className="hero__left">

          {/* Badge */}
          <p className="hero__badge">
            <span className="hero__badge-star" aria-hidden="true">✳</span>
            Harness The Full Potential Of Data With
          </p>

          {/* Main heading */}
          <h1 className="hero__heading">
            <span className="hero__heading-line">OUR SCRAPING</span>
            <span className="hero__heading-line">EXPERTISE</span>
          </h1>

          {/* Sub-heading */}
          <p className="hero__sub">
            Real-time data extraction, intelligence, and APIs — built for
            enterprises that move fast and think smarter.
          </p>

          {/* CTA buttons */}
          <div className="hero__actions">
            <a href="/get-quote" className="hero__btn hero__btn--primary">
              Get Started
            </a>
            <a href="#solutions" className="hero__btn hero__btn--outline">
              View Solutions
            </a>
          </div>
        </div>

        {/* Right — Highlight card */}
        <div className="hero__right">
          <div className="hero__card">
            <p className="hero__card-text">
              Built <span className="hero__card-accent">High-Impact</span>
            </p>
            <p className="hero__card-sub">Use cases</p>
          </div>
        </div>

      </div>

      {/* ── WhatsApp FAB ── */}
      <a
        href={WHATSAPP_URL}
        className="hero__wa"
        aria-label="Chat on WhatsApp"
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
        </svg>
      </a>

    </section>
  );
}
