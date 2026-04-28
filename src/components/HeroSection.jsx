import { useEffect, useRef } from "react";
import "./HeroSection.css";

const WHATSAPP_URL = "https://wa.me/917490947694";

export default function HeroSection() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    requestAnimationFrame(() => el.classList.add("hero--visible"));
  }, []);

  return (
    <section className="hero" ref={sectionRef} aria-label="Hero">
      <div className="hero__inner container">

        {/* ── Left column ── */}
        <div className="hero__left">

          <p className="hero__badge">
            <span className="hero__badge-star" aria-hidden="true">✳</span>
            Harness The Full Potential Of Data With
          </p>

          <h1 className="hero__heading">
            <span>OUR SCRAPING</span>
            <span>EXPERTISE</span>
          </h1>

          <p className="hero__sub">
            Real-time data extraction, intelligence, and APIs — built for
            enterprises that move fast and think smarter.
          </p>

        </div>

        {/* ── Right column — arc image card ── */}
        <div className="hero__right">

          {/* The big rounded card with animated arcs */}
          <div className="hero__arc-card" aria-hidden="true">
            {/* SVG arc lines — pure CSS animated */}
            <svg
              className="hero__arc-svg"
              viewBox="0 0 520 480"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="xMidYMid slice"
            >
              {/* Flowing arc lines — each is a large arc path */}
              {[0,1,2,3,4,5,6,7,8,9,10].map((i) => (
                <path
                  key={i}
                  className="hero__arc-path"
                  style={{ "--delay": `${i * 0.18}s`, "--idx": i }}
                  d={`M ${-60 + i * 28},480 Q ${200 + i * 18},${240 - i * 8} ${560 - i * 10},${-20 + i * 12}`}
                  stroke="rgba(255,255,255,0.75)"
                  strokeWidth={i % 3 === 0 ? "2" : "1.2"}
                  fill="none"
                />
              ))}
            </svg>
          </div>

          {/* "Built High-Impact" card — overlaps bottom-right of arc card */}
          <div className="hero__highlight-card">
            <p className="hero__highlight-text">
              Built <span className="hero__highlight-accent">High-Impact</span>
            </p>
            <p className="hero__highlight-sub">Use cases</p>
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
