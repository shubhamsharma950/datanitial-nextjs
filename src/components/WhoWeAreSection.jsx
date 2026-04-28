import { useEffect, useState } from "react";
import "./WhoWeAreSection.css";

const WP_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.NEXT_PUBLIC_WP_REST_URL) ||
  "https://darkred-worm-224502.hostingersite.com/wp-json";

/* ─────────────────────────────────────────────────────────────
   STATIC FALLBACK
   Shown until WordPress ACF fields are filled in.
   Matches the design screenshot exactly.
───────────────────────────────────────────────────────────── */
const FALLBACK = {
  section_title: "Transforming Web Data into Business Intelligence",
  section_desc:  "We deliver enterprise-grade data extraction and intelligence solutions that scale with your business — ensuring accuracy, speed, and reliability for smarter decision-making.",
  cards: [
    {
      image:       "",
      image_alt:   "Scalable Data Extraction",
      title:       "Scalable Data Extraction",
      description: "Extract massive volumes of data from websites and apps with speed, accuracy, and reliability.",
      bullets:     ["Multi-source extraction", "Handles dynamic content", "High-volume processing"],
    },
    {
      image:       "",
      image_alt:   "Data Protection",
      title:       "Data Protection",
      description: "Your data is handled with strict security protocols, ensuring complete protection, compliance, and confidentiality at every step.",
      bullets:     ["End-to-end encryption", "GDPR compliant", "Secure data pipelines"],
    },
    {
      image:       "",
      image_alt:   "Real-Time Data Intelligence",
      title:       "Real-Time Data Intelligence",
      description: "Access live data streams through our robust API infrastructure built for high-frequency enterprise use.",
      bullets:     ["Low-latency responses", "99.9% uptime SLA", "Flexible endpoints"],
    },
  ],
};

/* ── Check icon ── */
const CheckIcon = () => (
  <svg className="wwa-card__check" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <circle cx="10" cy="10" r="10" />
    <path fill="none" d="M6 10l3 3 5-5" stroke="#fff" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ── Skeleton ── */
function WhoWeAreSkeleton() {
  return (
    <section className="wwa">
      <div className="wwa__inner">
        <div className="wwa__header">
          <div className="skeleton" style={{ width: "60%", height: 36, marginBottom: 12, margin: "0 auto 12px" }} />
          <div className="skeleton" style={{ width: "80%", height: 18, margin: "0 auto" }} />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="wwa-card wwa-card--skeleton">
            <div className="skeleton wwa-card__img-wrap" />
            <div className="wwa-card__body">
              <div className="skeleton" style={{ width: "50%", height: 22, marginBottom: 10 }} />
              <div className="skeleton" style={{ width: "90%", height: 14, marginBottom: 6 }} />
              <div className="skeleton" style={{ width: "70%", height: 14 }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   WHO WE ARE SECTION
   Fetches /theme/v1/who-we-are from WordPress.
   Falls back to static data if API unavailable.
═══════════════════════════════════════════════ */
export default function WhoWeAreSection() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${WP_BASE}/theme/v1/who-we-are`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => {
        // Use API data only if it has actual cards with content
        const hasCards = Array.isArray(d?.cards) && d.cards.length > 0 &&
                         d.cards.some(c => c.title || c.description);
        setData(hasCards ? d : FALLBACK);
      })
      .catch(() => setData(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <WhoWeAreSkeleton />;

  const d = data ?? FALLBACK;

  return (
    <section className="wwa" aria-label="Who We Are">
      <div className="wwa__inner">

        {/* ── Section header ── */}
        {(d.section_title || d.section_desc) && (
          <div className="wwa__header">
            {d.section_title && (
              <h2 className="wwa__title">{d.section_title}</h2>
            )}
            {d.section_desc && (
              <p className="wwa__desc">{d.section_desc}</p>
            )}
          </div>
        )}

        {/* ── Cards ── */}
        <div className="wwa__cards">
          {d.cards.map((card, i) => (
            <article key={i} className="hp-service wwa-card" aria-label={card.title}>

              {/* Image */}
              <div className="hp-service__img-wrap wwa-card__img-wrap">
                {card.image ? (
                  <img
                    src={card.image}
                    alt={card.image_alt || card.title}
                    className="hp-service__img wwa-card__img"
                    loading="lazy"
                  />
                ) : (
                  <div className="hp-service__img-placeholder wwa-card__img-placeholder" aria-hidden="true">
                    <svg viewBox="0 0 80 60" fill="none">
                      <rect width="80" height="60" rx="8" fill="#0d1b4b" />
                      <circle cx="20" cy="20" r="10" fill="#1a3a8f" opacity=".8" />
                      <circle cx="55" cy="35" r="14" fill="#1e4db7" opacity=".5" />
                      <rect x="8" y="44" width="64" height="3" rx="2" fill="#2563eb" opacity=".4" />
                      <rect x="18" y="51" width="44" height="3" rx="2" fill="#2563eb" opacity=".25" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="hp-service__body wwa-card__body">
                {card.title && (
                  <h3 className="hp-service__title wwa-card__title">{card.title}</h3>
                )}
                {card.description && (
                  <p className="hp-service__desc wwa-card__desc">{card.description}</p>
                )}
                {card.bullets?.length > 0 && (
                  <ul className="hp-service__bullets wwa-card__bullets">
                    {card.bullets.map((b, bi) => (
                      <li key={bi} className="hp-service__bullet wwa-card__bullet">
                        <CheckIcon />
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
