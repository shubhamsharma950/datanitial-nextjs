import { useEffect, useRef } from "react";
import "./HeroBanner.css";

export default function HeroBanner() {
  const cardRef      = useRef(null);
  const faviconRef   = useRef(null);
  const logoRef      = useRef(null);
  const ctaRef       = useRef(null);
  const textPanelRef = useRef(null);

  useEffect(() => {
    const card      = cardRef.current;
    const favicon   = faviconRef.current;
    const logo      = logoRef.current;
    const cta       = ctaRef.current;
    const textPanel = textPanelRef.current;

    const timers = [];
    const add = (fn, delay) => timers.push(setTimeout(fn, delay));

    // Phase 2 — card rounds corners
    add(() => card.classList.add("dn-phase2"), 2400);

    // Phase 2b — favicon rises + floats
    add(() => favicon.classList.add("dn-visible", "dn-float"), 3100);

    // Phase 3 — favicon exits
    add(() => {
      favicon.classList.remove("dn-visible", "dn-float");
      favicon.classList.add("dn-exit");
    }, 4700);

    // Phase 3b — full logo appears
    add(() => logo.classList.add("dn-visible"), 4900);

    // Phase 3→4 — logo exits
    add(() => {
      logo.classList.remove("dn-visible");
      logo.classList.add("dn-exit");
    }, 6300);

    // Phase 4 — card slides to final position
    add(() => {
      card.classList.remove("dn-phase2");
      card.classList.add("dn-phase4");
    }, 6700);

    // Phase 4b — text panel slides in
    add(() => textPanel.classList.add("dn-visible"), 7100);

    // Phase 4c — CTA fades in
    add(() => cta.classList.add("dn-visible"), 7900);

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="dn-stage">

      {/* ── CARD ── */}
      <div className="dn-card" ref={cardRef}>
        <div className="overlay" />
        {/* Favicon — Phase 2 */}
        <div className="dn-favicon-wrap" ref={faviconRef}>
          <img
            className="dn-favicon-img"
            src="https://darkred-worm-224502.hostingersite.com/wp-content/uploads/2026/04/favss.png"
            alt="icon"
            loading="eager"
          />
        </div>

        {/* Full Logo — Phase 3 */}
        <div className="dn-logo-wrap" ref={logoRef}>
          <img
            className="dn-logo-img"
            src="https://darkred-worm-224502.hostingersite.com/wp-content/uploads/2026/04/logo-second.png"
            alt="Datanitial"
            loading="eager"
          />
        </div>

        {/* CTA — Phase 4 */}
        <div className="dn-cta-block" ref={ctaRef}>
          <p className="dn-cta-line">
            Built <span className="dn-cta-accent">High-Impact</span>
          </p>
          <p className="dn-cta-line">Use cases</p>
        </div>
      </div>

      {/* ── TEXT PANEL ── */}
      <div className="dn-text-panel" ref={textPanelRef}>
        <p className="dn-eyebrow">
          <span className="dn-asterisk">
            <img className="top-ss-icon"
              src="https://darkred-worm-224502.hostingersite.com/wp-content/uploads/2026/04/ss.png"
              alt=""
            />
          </span>
          Harness The Full Potential Of Data With
        </p>
        <h1 className="dn-main-heading">
          OUR SCRAPING
          <br />
          EXPERTISE
        </h1>
        <p className="dn-para">
          Real-time data extraction, intelligence, and APIs&nbsp;— built for
          enterprises that move fast and think smarter.
        </p>
      </div>

    </div>
  );
}
