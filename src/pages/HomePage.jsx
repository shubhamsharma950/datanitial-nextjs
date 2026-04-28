import { useEffect, useState } from "react";
import { getHomePage } from "../services/api";
import "./HomePage.css";

/* ═══════════════════════════════════════════════
   FALLBACK DATA
   Used when WordPress API is unavailable.
═══════════════════════════════════════════════ */
const FALLBACK = {
  hero: {
    badge:      "Harness The Full Potential Of Data With",
    heading:    "OUR SCRAPING\nEXPERTISE",
    subheading: "Real-time data extraction, intelligence, and APIs — built for enterprises that move fast and think smarter.",
    highlight:  "Built High-Impact\nUse cases",
    bg_image:   "",
    cta_primary:   null,
    cta_secondary: null,
  },
  tagline: {
    heading:    "Empowering smarter decisions with data.",
    subheading: "We combine technology, automation, and data expertise to unlock meaningful insights for the digital world.",
  },
  services: [
    {
      id: 1,
      title:       "Scalable Data Extraction",
      description: "Extract massive volumes of data from websites and apps with speed, accuracy, and reliability.",
      image:       "",
      bullets:     ["Multi-source extraction", "Handles dynamic content", "High-volume processing"],
    },
    {
      id: 2,
      title:       "Data Protection",
      description: "Your data is handled with strict security protocols, ensuring complete protection, compliance, and confidentiality at every step.",
      image:       "",
      bullets:     ["End-to-end encryption", "GDPR compliant", "Secure data pipelines"],
    },
    {
      id: 3,
      title:       "Real-Time API",
      description: "Access live data streams through our robust API infrastructure built for high-frequency enterprise use.",
      image:       "",
      bullets:     ["Low-latency responses", "99.9% uptime SLA", "Flexible endpoints"],
    },
  ],
  stats: [
    { id: 1, value: "10B+",  label: "Data Points Processed" },
    { id: 2, value: "500+",  label: "Enterprise Clients"     },
    { id: 3, value: "99.9%", label: "Uptime Guarantee"       },
    { id: 4, value: "50+",   label: "Industries Served"      },
  ],
  cta: {
    heading:    "Ready to unlock the power of data?",
    subheading: "Talk to our experts and get a custom data solution built for your business.",
    button:     null,
  },
};

/* ═══════════════════════════════════════════════
   SKELETON
═══════════════════════════════════════════════ */
function HeroSkeleton() {
  return (
    <section className="hp-hero hp-hero--skeleton">
      <div className="container">
        <div className="skeleton" style={{ width: "60%", height: 20, marginBottom: 16 }} />
        <div className="skeleton" style={{ width: "80%", height: 72, marginBottom: 12 }} />
        <div className="skeleton" style={{ width: "75%", height: 72, marginBottom: 24 }} />
        <div className="skeleton" style={{ width: "50%", height: 18, marginBottom: 32 }} />
        <div style={{ display: "flex", gap: 16 }}>
          <div className="skeleton" style={{ width: 140, height: 48, borderRadius: 999 }} />
          <div className="skeleton" style={{ width: 140, height: 48, borderRadius: 999 }} />
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   CHECK ICON
═══════════════════════════════════════════════ */
const CheckIcon = () => (
  <svg className="hp-service__check" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <circle cx="10" cy="10" r="10" />
    <path fill="none" d="M6 10l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ═══════════════════════════════════════════════
   HOMEPAGE COMPONENT
═══════════════════════════════════════════════ */
export default function HomePage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHomePage()
      .then((res) => {
        if (res?.data) setData(res.data);
        else           setData(FALLBACK);
      })
      .catch(() => setData(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <HeroSkeleton />;

  const d = data ?? FALLBACK;

  return (
    <main className="hp">

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section
        className="hp-hero"
        style={d.hero?.bg_image ? { backgroundImage: `url(${d.hero.bg_image})` } : {}}
        aria-label="Hero"
      >
        <div className="hp-hero__overlay" aria-hidden="true" />
        <div className="container hp-hero__content">
          <div className="hp-hero__left">

            {d.hero?.badge && (
              <p className="hp-hero__badge">
                <span className="hp-hero__badge-star" aria-hidden="true">✳</span>
                {d.hero.badge}
              </p>
            )}

            <h1 className="hp-hero__heading">
              {d.hero?.heading?.split("\n").map((line, i) => (
                <span key={i} className="hp-hero__heading-line">{line}</span>
              ))}
            </h1>

            {d.hero?.subheading && (
              <p className="hp-hero__sub">{d.hero.subheading}</p>
            )}

            <div className="hp-hero__actions">
              {d.hero?.cta_primary && (
                <a href={d.hero.cta_primary.url} className="hp-btn hp-btn--primary">
                  {d.hero.cta_primary.label}
                </a>
              )}
              {d.hero?.cta_secondary && (
                <a href={d.hero.cta_secondary.url} className="hp-btn hp-btn--outline">
                  {d.hero.cta_secondary.label}
                </a>
              )}
            </div>
          </div>

          {d.hero?.highlight && (
            <div className="hp-hero__highlight" aria-label="Key benefit">
              {d.hero.highlight.split("\n").map((line, i) => (
                <span key={i}>
                  {i === 0
                    ? <><span className="hp-hero__highlight-em">Built </span><span className="hp-hero__highlight-blue">High-Impact</span></>
                    : line}
                  {i < d.hero.highlight.split("\n").length - 1 && <br />}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════
          TAGLINE
      ══════════════════════════════════════ */}
      {d.tagline && (
        <section className="hp-tagline section section--soft" aria-label="Tagline">
          <div className="container">
            <h2 className="hp-tagline__heading">{d.tagline.heading}</h2>
            {d.tagline.subheading && (
              <p className="hp-tagline__sub">{d.tagline.subheading}</p>
            )}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════
          SERVICES
      ══════════════════════════════════════ */}
      {d.services?.length > 0 && (
        <section className="hp-services section" aria-label="Services">
          <div className="container">
            <div className="hp-services__list">
              {d.services.map((svc, idx) => (
                <article key={svc.id ?? idx} className="hp-service" aria-label={svc.title}>

                  <div className="hp-service__img-wrap">
                    {svc.image ? (
                      <img src={svc.image} alt={svc.title} className="hp-service__img" />
                    ) : (
                      <div className="hp-service__img-placeholder" aria-hidden="true">
                        <svg viewBox="0 0 80 60" fill="none">
                          <rect width="80" height="60" rx="8" fill="#1a1a3e" />
                          <circle cx="20" cy="20" r="8" fill="#2b2d8e" opacity=".7" />
                          <circle cx="50" cy="35" r="12" fill="#4a4fcf" opacity=".5" />
                          <rect x="10" y="40" width="60" height="3" rx="2" fill="#3d40b5" opacity=".4" />
                          <rect x="20" y="48" width="40" height="3" rx="2" fill="#3d40b5" opacity=".3" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="hp-service__body">
                    <h3 className="hp-service__title">{svc.title}</h3>
                    <p className="hp-service__desc">{svc.description}</p>
                    {svc.bullets?.length > 0 && (
                      <ul className="hp-service__bullets">
                        {svc.bullets.map((b, bi) => (
                          <li key={bi} className="hp-service__bullet">
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
      )}

      {/* ══════════════════════════════════════
          STATS
      ══════════════════════════════════════ */}
      {d.stats?.length > 0 && (
        <section className="hp-stats section section--soft" aria-label="Statistics">
          <div className="container">
            <div className="hp-stats__grid">
              {d.stats.map((s, i) => (
                <div key={s.id ?? i} className="hp-stat">
                  <span className="hp-stat__value">{s.value}</span>
                  <span className="hp-stat__label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════ */}
      {d.cta && (
        <section className="hp-cta section" aria-label="Call to action">
          <div className="container">
            <div className="hp-cta__box">
              <h2 className="hp-cta__heading">{d.cta.heading}</h2>
              {d.cta.subheading && (
                <p className="hp-cta__sub">{d.cta.subheading}</p>
              )}
              {d.cta.button && (
                <a href={d.cta.button.url} className="hp-btn hp-btn--primary hp-btn--lg">
                  {d.cta.button.label}
                </a>
              )}
            </div>
          </div>
        </section>
      )}

    </main>
  );
}
