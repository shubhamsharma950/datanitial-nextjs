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
        <div className="dn-card-overlay" />

        {/* Wave SVG */}
        <svg
          className="dn-wave-svg"
          viewBox="0 0 1400 900"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="dn-wg1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#b8c3e0" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#cdd6ee" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <g fill="none" stroke="url(#dn-wg1)" strokeWidth="1.2">
            <path d="M-200,750 Q150,320 500,500 Q850,680 1150,380 T1700,430" />
            <path d="M-200,700 Q150,270 500,450 Q850,630 1150,330 T1700,380" />
            <path d="M-200,650 Q150,220 500,400 Q850,580 1150,280 T1700,330" />
            <path d="M-200,800 Q150,370 500,550 Q850,730 1150,430 T1700,480" />
            <path d="M-200,850 Q150,420 500,600 Q850,780 1150,480 T1700,530" />
            <path d="M-200,600 Q150,170 500,350 Q850,530 1150,230 T1700,280" />
            <path d="M-200,550 Q150,120 500,300 Q850,480 1150,180 T1700,230" />
            <path d="M-200,500 Q150,70  500,250 Q850,430 1150,130 T1700,180" />
            <path d="M-200,900 Q150,470 500,650 Q850,830 1150,530 T1700,580" />
            <path d="M-200,450 Q150,20  500,200 Q850,380 1150,80  T1700,130" />
            <path d="M-200,400 Q150,-30 500,150 Q850,330 1150,30  T1700,80"  stroke="#b0bcd8" strokeOpacity="0.5" />
            <path d="M-200,350 Q200,50  600,230 Q1000,410 1300,110 T1700,150" stroke="#aab8d6" strokeOpacity="0.4" />
            <path d="M-200,950 Q150,520 500,700 Q850,880 1150,580 T1700,630" stroke="#b0bcd8" strokeOpacity="0.5" />
          </g>
        </svg>

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
            src="https://darkred-worm-224502.hostingersite.com/wp-content/uploads/2026/04/logo-second-1.png"
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
